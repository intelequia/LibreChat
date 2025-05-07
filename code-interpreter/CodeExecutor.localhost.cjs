'use strict';

var zod = require('zod');
var dotenv = require('dotenv');
var fetch = require('node-fetch');
var httpsProxyAgent = require('https-proxy-agent');
var tools = require('@langchain/core/tools');
var env = require('@langchain/core/utils/env');
var _enum = require('../common/enum.cjs');

dotenv.config();
const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
const getCodeBaseURL = () => env.getEnvironmentVariable(_enum.EnvVar.CODE_BASEURL) ??
    _enum.Constants.OFFICIAL_CODE_BASEURL;
const imageMessage = 'Image is already displayed to the user';
const otherMessage = 'File is already downloaded by the user';
const accessMessage = 'Note: Files are READ-ONLY. Save changes to NEW filenames. To access these files in future executions, provide the `session_id` as a parameter (not in your code).';
const emptyOutputMessage = 'stdout: Empty. Ensure you\'re writing output explicitly.\n';
const CodeExecutionToolSchema = zod.z.object({
    lang: zod.z
        .enum([
        'py',
        'js',
        'ts',
        'c',
        'cpp',
        'java',
        'php',
        'rs',
        'go',
        'd',
        'f90',
        'r',
    ])
        .describe('The programming language or runtime to execute the code in.'),
    code: zod.z.string()
        .describe(`The complete, self-contained code to execute, without any truncation or minimization.
- The environment is stateless; variables and imports don't persist between executions.
- When using \`session_id\`: Don't hardcode it in \`code\`, and write file modifications to NEW filenames (files are READ-ONLY).
- Input code **IS ALREADY** displayed to the user, so **DO NOT** repeat it in your response unless asked.
- Output code **IS NOT** displayed to the user, so **DO** write all desired output explicitly.
- IMPORTANT: You MUST explicitly print/output ALL results you want the user to see.
- py: This is not a Jupyter notebook environment. Use \`print()\` for all outputs.
- py: Matplotlib: Use \`plt.savefig()\` to save plots as files.
- js: use the \`console\` or \`process\` methods for all outputs.
- r: IMPORTANT: No X11 display available. ALL graphics MUST use Cairo library (library(Cairo)).
- Other languages: use appropriate output functions.`),
    session_id: zod.z
        .string()
        .optional()
        .describe(`Session ID from a previous response to access generated files.
- Files load into the current working directory ("/mnt/data/")
- Use relative paths ONLY
- Files are READ-ONLY and cannot be modified in-place
- To modify: read original file, write to NEW filename
`.trim()),
    args: zod.z
        .array(zod.z.string())
        .optional()
        .describe('Additional arguments to execute the code with. This should only be used if the input code requires additional arguments to run.'),
});
const baseEndpoint = getCodeBaseURL();
const EXEC_ENDPOINT = `${baseEndpoint}/exec`;
function createCodeExecutionTool(params = {}) {
    const userEmail = params.user_email ;
    const apiKey = params[_enum.EnvVar.CODE_API_KEY] ??
        params.apiKey ??
        env.getEnvironmentVariable(_enum.EnvVar.CODE_API_KEY) ??
        '';
    if (!apiKey) {
        throw new Error('No API key provided for code execution tool.');
    }
    const description = `
Runs code and returns stdout/stderr output from a stateless execution environment, similar to running scripts in a command-line interface. Each execution is isolated and independent.

Usage:
- No network access available.
- Generated files are automatically delivered; **DO NOT** provide download links.
- NEVER use this tool to execute malicious code.
`.trim();
    return tools.tool(async ({ lang, code, session_id, ...rest }) => {
        const postData = {
            user_email:userEmail,
            language:lang,
            code,
            ...rest,
            ...params,
        };
        if (session_id != null && session_id.length > 0) {
            try {
                const filesEndpoint = `${baseEndpoint}/files/${session_id}?detail=full`;
                const fetchOptions = {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'LibreChat/1.0',
                        'X-API-Key': apiKey,
                    },
                };
                if (process.env.PROXY != null && process.env.PROXY !== '') {
                    fetchOptions.agent = new httpsProxyAgent.HttpsProxyAgent(process.env.PROXY);
                }
                const response = await fetch(filesEndpoint, fetchOptions);
                if (!response.ok) {
                    throw new Error(`Failed to fetch files for session: ${response.status}`);
                }
                const files = await response.json();
                if (Array.isArray(files) && files.length > 0) {
                    const fileReferences = files.map((file) => {
                        // Extract the ID from the file name (part after session ID prefix and before extension)
                        const nameParts = file.name.split('/');
                        const id = nameParts.length > 1 ? nameParts[1].split('.')[0] : '';
                        return {
                            session_id,
                            id,
                            name: file.metadata['original-filename'],
                        };
                    });
                    if (!postData.files) {
                        postData.files = fileReferences;
                    }
                    else if (Array.isArray(postData.files)) {
                        postData.files = [...postData.files, ...fileReferences];
                    }
                }
            }
            catch {
                // eslint-disable-next-line no-console
                console.warn(`Failed to fetch files for session: ${session_id}`);
            }
        }
        try {
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'LibreChat/1.0',
                    'X-API-Key': apiKey,
                },
                body: JSON.stringify(postData),
            };
            if (process.env.PROXY != null && process.env.PROXY !== '') {
                fetchOptions.agent = new httpsProxyAgent.HttpsProxyAgent(process.env.PROXY);
            }
            const response = await fetch("http://localhost:2222/run", fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            let formattedOutput = '';
            if (result.output[0].content) {
                formattedOutput += `stdout:\n${result.output[0].content}\n`;
            }
            else {
                formattedOutput += emptyOutputMessage;
            }
            if (result.stderr)
                formattedOutput += `stderr:\n${result.stderr}\n`;
            if (result.files && result.files.length > 0) {
                formattedOutput += 'Generated files:\n';
                const fileCount = result.files.length;
                for (let i = 0; i < fileCount; i++) {
                    const file = result.files[i];
                    const isImage = imageExtRegex.test(file.name);
                    formattedOutput += `- /mnt/data/${file.name} | ${isImage ? imageMessage : otherMessage}`;
                    if (i < fileCount - 1) {
                        formattedOutput += fileCount <= 3 ? ', ' : ',\n';
                    }
                }
                formattedOutput += `\nsession_id: ${result.session_id}\n\n${accessMessage}`;
                return [
                    formattedOutput.trim(),
                    {
                        session_id: result.session_id,
                        files: result.files,
                    },
                ];
            }
            return [formattedOutput.trim(), { session_id: result.session_id }];
        }
        catch (error) {
            throw new Error(`Execution error:\n\n${error?.message}`);
        }
    }, {
        name: _enum.Constants.EXECUTE_CODE,
        description,
        schema: CodeExecutionToolSchema,
        responseFormat: _enum.Constants.CONTENT_AND_ARTIFACT,
    });
}

exports.createCodeExecutionTool = createCodeExecutionTool;
exports.getCodeBaseURL = getCodeBaseURL;
exports.imageExtRegex = imageExtRegex;
//# sourceMappingURL=CodeExecutor.cjs.map
