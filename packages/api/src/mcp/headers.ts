import type { MCPOptions } from 'librechat-data-provider';

type ApiKeyConfig = Partial<NonNullable<MCPOptions['apiKey']>> | null | undefined;

export const MCP_AUTHORIZATIONS_HEADER = 'x-librechat-mcp-authorizations';
export const MAX_MCP_REQUEST_AUTHORIZATIONS = 16;
export const MAX_MCP_AUTHORIZATIONS_HEADER_LENGTH = 16_384;

export type MCPRequestAuthorizations = Record<string, string>;

export class MCPRequestAuthorizationError extends Error {
  status = 400;
  code = 'invalid_mcp_authorizations';

  constructor(message: string) {
    super(message);
    this.name = 'MCPRequestAuthorizationError';
  }
}

/** Parses request-only MCP Authorization values without retaining the incoming header object. */
export function parseMCPRequestAuthorizations(
  value: string | string[] | undefined,
): MCPRequestAuthorizations | undefined {
  if (value == null) {
    return;
  }
  if (Array.isArray(value) || value.length > MAX_MCP_AUTHORIZATIONS_HEADER_LENGTH) {
    throw new MCPRequestAuthorizationError('Invalid MCP authorizations header');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new MCPRequestAuthorizationError('Invalid MCP authorizations header');
  }
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MCPRequestAuthorizationError('Invalid MCP authorizations header');
  }

  const entries = Object.entries(parsed);
  if (entries.length === 0 || entries.length > MAX_MCP_REQUEST_AUTHORIZATIONS) {
    throw new MCPRequestAuthorizationError('Invalid MCP authorizations header');
  }

  const authorizations = Object.create(null) as MCPRequestAuthorizations;
  for (const [serverName, authorization] of entries) {
    if (
      serverName.trim() !== serverName ||
      serverName.length === 0 ||
      typeof authorization !== 'string' ||
      !/^Bearer \S+$/.test(authorization)
    ) {
      throw new MCPRequestAuthorizationError('Invalid MCP authorizations header');
    }
    authorizations[serverName] = authorization;
  }
  return authorizations;
}

export function assertMCPRequestAuthorizationsUsed(
  authorizations: MCPRequestAuthorizations | undefined,
  usedServerNames: ReadonlySet<string>,
): void {
  if (!authorizations) {
    return;
  }
  const unusedServerNames = Object.keys(authorizations).filter(
    (serverName) => !usedServerNames.has(serverName),
  );
  if (unusedServerNames.length > 0) {
    throw new MCPRequestAuthorizationError(
      `MCP authorization provided for unavailable server(s): ${unusedServerNames.join(', ')}`,
    );
  }
}

/** Adds one request-only bearer to the selected server's chat-time headers. */
export function applyMCPRequestAuthorization<T extends MCPOptions>(
  config: T,
  authorization?: string,
): T {
  if (!authorization) {
    return config;
  }
  if (config.type !== 'sse' && config.type !== 'http' && config.type !== 'streamable-http') {
    throw new MCPRequestAuthorizationError('MCP request authorization requires an HTTP transport');
  }
  const authorizationTemplate = Object.entries(config.headers ?? {}).find(
    ([name]) => name.toLowerCase() === 'authorization',
  )?.[1];
  const overriddenVariables = new Set(
    Object.keys(config.customUserVars ?? {}).filter((name) =>
      typeof authorizationTemplate === 'string'
        ? authorizationTemplate.includes(`{{${name}}}`)
        : false,
    ),
  );
  const effective = {
    ...config,
    requestHeaders: {
      ...config.requestHeaders,
      Authorization: authorization,
    },
  };
  if (overriddenVariables.size === 0 || !effective.customUserVars) {
    return effective;
  }
  return {
    ...effective,
    customUserVars: Object.fromEntries(
      Object.entries(effective.customUserVars).filter(([name]) => !overriddenVariables.has(name)),
    ),
  };
}

function getApiKeyHeaderName(apiKey: ApiKeyConfig): string {
  return apiKey?.authorization_type === 'custom'
    ? apiKey.custom_header || 'X-Api-Key'
    : 'Authorization';
}

/** The header injected by an operator-provided API key, before placeholder resolution. */
export function getAdminApiKeyHeader(
  apiKey: ApiKeyConfig,
): { name: string; value: string } | undefined {
  if (apiKey?.source !== 'admin' || !apiKey.key) {
    return;
  }
  const { key, authorization_type } = apiKey;
  const name = getApiKeyHeaderName(apiKey);
  const prefixes = { basic: 'Basic ', bearer: 'Bearer ', custom: '' };
  const prefix = prefixes[authorization_type ?? 'custom'];
  return { name, value: `${prefix}${key}` };
}

/** A shadowed catalog credential must not be injected or required by a chat connection. */
export function isApiKeyHeaderOverridden(
  apiKey: ApiKeyConfig,
  requestHeaders?: Record<string, string | undefined>,
): boolean {
  const injected = apiKey?.source === 'user' || getAdminApiKeyHeader(apiKey) != null;
  return (
    injected &&
    requestHeaders != null &&
    Object.keys(requestHeaders).some(
      (name) => name.toLowerCase() === getApiKeyHeaderName(apiKey).toLowerCase(),
    )
  );
}
