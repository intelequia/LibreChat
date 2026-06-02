'use strict';

var dotenv = require('dotenv');
var tools = require('@langchain/core/tools');
var env = require('@langchain/core/utils/env');
var _enum = require('../common/enum.cjs');

dotenv.config();
const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
const getCodeBaseURL = () => env.getEnvironmentVariable('CODE_INTERPRETER_API_URL')
    ?? env.getEnvironmentVariable(_enum.EnvVar.CODE_BASEURL)
    ?? 'http://code-interpreter-manager:3000';
const imageMessage = ' - the image is already displayed to the user';
const otherMessage = ' - the file is already downloaded by the user';
const SUPPORTED_LANGUAGES = [
    'py',
    'python',
    'js',
    'javascript',
    'ts',
    'typescript',
    'sh',
    'shell',
    'bash',
    'r',
    'rb',
    'ruby',
    'java',
    'cs',
    'csharp',
    'powershell',
    'pwsh',
    'ps1',
    'html',
    'react',
];
const CodeExecutionToolSchema = {
    type: 'object',
    properties: {
        lang: {
            type: 'string',
            enum: SUPPORTED_LANGUAGES,
            description: 'The programming language or runtime to execute the code in.',
        },
        code: {
            type: 'string',
            description: `The complete, self-contained code to execute, without any truncation or minimization.
- The environment is stateless; variables and imports don't persist between executions.
- Input code **IS ALREADY** displayed to the user, so **DO NOT** repeat it in your response unless asked.
- Output code **IS NOT** displayed to the user, so **DO** write all desired output explicitly.
- IMPORTANT: You MUST explicitly print/output ALL results you want the user to see.
- Uploaded files are available at \`/app/files/uploads/\` (e.g. \`/app/files/uploads/data.csv\`).
- Save generated files to \`/app/files/\` (e.g. \`/app/files/chart.png\`). They are delivered automatically.
- py: This is not a Jupyter notebook environment. Use \`print()\` for all outputs.
- py: Matplotlib: Use \`plt.savefig('/app/files/<name>.png')\` to save plots as files.
- js: use the \`console\` or \`process\` methods for all outputs.
- r: IMPORTANT: No X11 display available. ALL graphics MUST use Cairo library (library(Cairo)).
- Other languages: use appropriate output functions.`,
        },
        args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional arguments to execute the code with. This should only be used if the input code requires additional arguments to run.',
        },
    },
    required: ['lang', 'code'],
};
const CodeExecutionToolDescription = `
Runs code and returns stdout/stderr output from a stateless execution environment, similar to running scripts in a command-line interface. Each execution is isolated and independent.

Usage:
- No network access available.
- Generated files saved to /app/files/ are automatically delivered to the user as attachments.
- **DO NOT** provide download links or file paths to the user. Files are delivered automatically.
- If the user asks for a download link, explain that files appear as attachments in the conversation.
- NEVER use this tool to execute malicious code.
`.trim();
const CodeExecutionToolName = _enum.Constants.EXECUTE_CODE;
const CodeExecutionToolDefinition = {
    name: CodeExecutionToolName,
    description: CodeExecutionToolDescription,
    schema: CodeExecutionToolSchema,
};
async function resolveCodeApiAuthHeaders(authHeaders) {
    if (authHeaders == null) {
        return {};
    }
    if (typeof authHeaders === 'function') {
        return authHeaders();
    }
    return authHeaders;
}

function createCodeExecutionTool(params = {}) {
    const { authHeaders, ...executionParams } = params;
    const userEmail = executionParams.user_email || '';
    const userId = executionParams.user_id || '';
    const apiKey = env.getEnvironmentVariable('LIBRECHAT_CODE_API_KEY') || '';
    const execEndpoint = `${getCodeBaseURL()}/run`;
    return tools.tool(async ({ lang, code, ...rest }) => {
        const postData = {
            user_id: userId,
            user_email: userEmail,
            language: lang,
            code,
            ...rest,
        };
        try {
            const resolvedAuthHeaders = await resolveCodeApiAuthHeaders(authHeaders);
            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'LibreChat/1.0',
                ...resolvedAuthHeaders,
            };
            if (apiKey) {
                headers['X-API-Key'] = apiKey;
            }
            const response = await fetch(execEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(postData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
        name: CodeExecutionToolName,
        description: CodeExecutionToolDescription,
        schema: CodeExecutionToolSchema,
        responseFormat: _enum.Constants.CONTENT_AND_ARTIFACT,
    });
}

exports.CodeExecutionToolDefinition = CodeExecutionToolDefinition;
exports.CodeExecutionToolDescription = CodeExecutionToolDescription;
exports.CodeExecutionToolName = CodeExecutionToolName;
exports.CodeExecutionToolSchema = CodeExecutionToolSchema;
exports.buildCodeApiHttpErrorMessage = async function buildCodeApiHttpErrorMessage(method, endpoint, response) {
    let responseBody = '';
    try {
        responseBody = await response.text();
    }
    catch {
        responseBody = '';
    }
    const body = responseBody.trim();
    const bodySuffix = body === '' ? '' : `, body: ${body.slice(0, 1000)}`;
    return `CodeAPI request failed: ${method} ${endpoint} returned ${response.status}${bodySuffix}`;
};
exports.createCodeExecutionTool = createCodeExecutionTool;
exports.emptyOutputMessage = 'stdout: Empty. Ensure you\'re writing output explicitly.\n';
exports.getCodeBaseURL = getCodeBaseURL;
exports.imageExtRegex = imageExtRegex;
exports.resolveCodeApiAuthHeaders = resolveCodeApiAuthHeaders;
//# sourceMappingURL=CodeExecutor.cjs.map
