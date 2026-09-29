import {
  MCPRequestAuthorizationError,
  applyMCPRequestAuthorization,
  assertMCPRequestAuthorizationsUsed,
  parseMCPRequestAuthorizations,
} from './headers';

describe('parseMCPRequestAuthorizations', () => {
  it('parses bearer credentials keyed by MCP server', () => {
    const authorizations = parseMCPRequestAuthorizations(
      JSON.stringify({ github: 'Bearer github-token', jira: 'Bearer jira-token' }),
    );

    expect(authorizations).toEqual({
      github: 'Bearer github-token',
      jira: 'Bearer jira-token',
    });
    expect(Object.getPrototypeOf(authorizations)).toBeNull();
  });

  it.each([
    '[]',
    '{}',
    '{"github":"token"}',
    '{" github":"Bearer token"}',
    '{"github":"Bearer token with spaces"}',
  ])('rejects an invalid credential map without exposing its values', (value) => {
    expect(() => parseMCPRequestAuthorizations(value)).toThrow(MCPRequestAuthorizationError);
    try {
      parseMCPRequestAuthorizations(value);
    } catch (error) {
      expect(String(error)).not.toContain('token');
    }
  });
});

describe('assertMCPRequestAuthorizationsUsed', () => {
  it('rejects servers that were not resolved from the agent graph', () => {
    expect(() =>
      assertMCPRequestAuthorizationsUsed(
        { github: 'Bearer github-token', jira: 'Bearer jira-token' },
        new Set(['github']),
      ),
    ).toThrow('MCP authorization provided for unavailable server(s): jira');
  });
});

describe('applyMCPRequestAuthorization', () => {
  it('overrides Authorization and removes only its shadowed user variable', () => {
    const config = applyMCPRequestAuthorization(
      {
        type: 'streamable-http',
        url: 'https://mcp.example.com',
        headers: { authorization: 'Bearer {{AUTH_TOKEN}}', 'X-Tenant': '{{TENANT}}' },
        customUserVars: {
          AUTH_TOKEN: { title: 'Token', description: 'Authorization token' },
          TENANT: { title: 'Tenant', description: 'Tenant identifier' },
        },
      },
      'Bearer request-token',
    );

    expect(config).toEqual({
      type: 'streamable-http',
      url: 'https://mcp.example.com',
      headers: { authorization: 'Bearer {{AUTH_TOKEN}}', 'X-Tenant': '{{TENANT}}' },
      requestHeaders: { Authorization: 'Bearer request-token' },
      customUserVars: { TENANT: { title: 'Tenant', description: 'Tenant identifier' } },
    });
  });

  it('rejects request authorization for transports without HTTP headers', () => {
    expect(() =>
      applyMCPRequestAuthorization(
        { type: 'stdio', command: 'node', args: ['server.js'] },
        'Bearer request-token',
      ),
    ).toThrow('MCP request authorization requires an HTTP transport');
  });

  it('returns the original config when no override is present', () => {
    const config = { type: 'streamable-http' as const, url: 'https://mcp.example.com' };
    expect(applyMCPRequestAuthorization(config)).toBe(config);
  });
});
