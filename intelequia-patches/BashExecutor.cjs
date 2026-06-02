'use strict';

var dotenv = require('dotenv');
var tools = require('@langchain/core/tools');
var CodeExecutor = require('./CodeExecutor.cjs');
var _enum = require('../common/enum.cjs');

dotenv.config();
const baseEndpoint = CodeExecutor.getCodeBaseURL();
const EXEC_ENDPOINT = `${baseEndpoint}/run`;
const BashExecutionToolSchema = {
    type: 'object',
    properties: {
        command: {
            type: 'string',
            description: `The bash command or script to execute.
- The environment is stateless; variables and state don't persist between executions.
- Input code **IS ALREADY** displayed to the user, so **DO NOT** repeat it in your response unless asked.
- Output code **IS NOT** displayed to the user, so **DO** write all desired output explicitly.
- IMPORTANT: You MUST explicitly print/output ALL results you want the user to see.
- Uploaded files are available at \`/app/files/uploads/\` (e.g. \`/app/files/uploads/data.csv\`).
- Save generated files to \`/app/files/\` (e.g. \`/app/files/chart.png\`). They are delivered automatically.
- Use \`echo\`, \`printf\`, or \`cat\` for all outputs.`,
        },
        args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional arguments to execute the command with. This should only be used if the input command requires additional arguments to run.',
        },
    },
    required: ['command'],
};
const BashExecutionToolDescription = `
Runs bash commands and returns stdout/stderr output from a stateless execution environment, similar to running scripts in a command-line interface. Each execution is isolated and independent.

Usage:
- No network access available.
- Generated files saved to /app/files/ are automatically delivered to the user as attachments.
- **DO NOT** provide download links or file paths to the user. Files are delivered automatically.
- If the user asks for a download link, explain that files appear as attachments in the conversation.
- NEVER use this tool to execute malicious commands.
`.trim();
const BashToolOutputReferencesGuide = `
Referencing previous tool outputs:
- Every successful tool result is tagged with a reference key of the form \`tool<idx>turn<turn>\` (e.g., \`tool0turn0\`). The key appears either as a \`[ref: tool0turn0]\` prefix line or, when the output is a JSON object, as a \`_ref\` field on the object.
- To pipe a previous tool output into this tool, embed the placeholder \`{{tool<idx>turn<turn>}}\` literally anywhere in the \`command\` string (or any string arg). It will be substituted with the stored output verbatim before the command runs.
- The substituted value is the original output string (no \`[ref: …]\` prefix, no \`_ref\` key), so it is safe to pipe directly into \`jq\`, \`grep\`, \`awk\`, etc.
- Example (simple ASCII output): \`echo '{{tool0turn0}}' | jq '.foo'\` takes the full output of the first tool from the first turn and pipes it into jq.
- For payloads that may contain quotes, parentheses, backticks, or arbitrary bytes (random/binary data, JSON with embedded quotes, multi-line strings), prefer a quoted-delimiter heredoc over \`echo '…'\`. The heredoc body is not interpreted by the shell, so substituted payloads pass through unchanged.
- Heredoc example: \`wc -c << 'EOF'\\n{{tool0turn0}}\\nEOF\` (the quotes around \`'EOF'\` disable interpolation inside the body).
- Unknown reference keys are left in place and surfaced as \`[unresolved refs: …]\` after the output.
`.trim();
function buildBashExecutionToolDescription(options) {
    if (options?.enableToolOutputReferences === true) {
        return `${BashExecutionToolDescription}\n\n${BashToolOutputReferencesGuide}`;
    }
    return BashExecutionToolDescription;
}
const BashExecutionToolName = _enum.Constants.BASH_TOOL;
const BashExecutionToolDefinition = {
    name: BashExecutionToolName,
    description: BashExecutionToolDescription,
    schema: BashExecutionToolSchema,
};
const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
const imageMessage = ' - the image is already displayed to the user';
const otherMessage = ' - the file is already downloaded by the user';

function createBashExecutionTool(params = {}) {
    const { authHeaders, files, ...restParams } = params;
    const userEmail = restParams.user_email || '';
    const userId = restParams.user_id || '';
    const apiKey = require('@langchain/core/utils/env').getEnvironmentVariable('LIBRECHAT_CODE_API_KEY') || '';
    return tools.tool(async (rawInput, config) => {
        const { command, ...rest } = rawInput;
        const { session_id, _injected_files } = (config.toolCall ?? {});
        const postData = {
            user_id: userId,
            user_email: userEmail,
            language: 'bash',
            code: command,
            ...rest,
        };
        try {
            const resolvedAuthHeaders = await CodeExecutor.resolveCodeApiAuthHeaders(authHeaders);
            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'LibreChat/1.0',
                ...resolvedAuthHeaders,
            };
            if (apiKey) {
                headers['X-API-Key'] = apiKey;
            }
            const response = await fetch(EXEC_ENDPOINT, {
                method: 'POST',
                headers,
                body: JSON.stringify(postData),
            });
            if (!response.ok) {
                let responseBody = '';
                try { responseBody = await response.text(); } catch { }
                const body = responseBody.trim();
                const bodySuffix = body === '' ? '' : `, body: ${body.slice(0, 1000)}`;
                throw new Error(`CodeAPI request failed: POST ${EXEC_ENDPOINT} returned ${response.status}${bodySuffix}`);
            }
            const result = await response.json();
            let formattedOutput = '';
            if (result.output && Array.isArray(result.output) && result.output.length > 0) {
                const outputText = result.output
                    .filter(entry => entry && entry.content)
                    .map(entry => entry.content)
                    .join('');
                if (outputText) {
                    formattedOutput += `stdout:\n${outputText}\n`;
                }
                else {
                    formattedOutput += 'stdout: Empty. Ensure you\'re writing output explicitly.\n';
                }
            }
            else {
                formattedOutput += 'stdout: Empty. Ensure you\'re writing output explicitly.\n';
            }
            if (result.stderr)
                formattedOutput += `stderr:\n${result.stderr}\n`;
            if (result.files && result.files.length > 0) {
                formattedOutput += 'Generated files:\n';
                const fileCount = result.files.length;
                for (let i = 0; i < fileCount; i++) {
                    const filename = result.files[i].name;
                    const isImage = imageExtRegex.test(filename);
                    formattedOutput += isImage ? `${filename}${imageMessage}` : `${filename}${otherMessage}`;
                    if (i < fileCount - 1) {
                        formattedOutput += fileCount <= 3 ? ', ' : ',\n';
                    }
                }
                return [formattedOutput.trim(), {
                    session_id: result.session_id,
                    files: result.files,
                }];
            }
            return [formattedOutput.trim(), { session_id: result.session_id }];
        }
        catch (error) {
            return [`Execution error:\n\n${error?.message}`, {}];
        }
    }, {
        name: BashExecutionToolName,
        description: BashExecutionToolDescription,
        schema: BashExecutionToolSchema,
        responseFormat: _enum.Constants.CONTENT_AND_ARTIFACT,
    });
}

exports.BashExecutionToolDefinition = BashExecutionToolDefinition;
exports.BashExecutionToolDescription = BashExecutionToolDescription;
exports.BashExecutionToolName = BashExecutionToolName;
exports.BashExecutionToolSchema = BashExecutionToolSchema;
exports.BashToolOutputReferencesGuide = BashToolOutputReferencesGuide;
exports.buildBashExecutionToolDescription = buildBashExecutionToolDescription;
exports.createBashExecutionTool = createBashExecutionTool;
//# sourceMappingURL=BashExecutor.cjs.map
