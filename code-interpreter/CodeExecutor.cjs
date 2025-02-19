'use strict';

var zod = require('zod');
var dotenv = require('dotenv');
var tools = require('@langchain/core/tools');
var env = require('@langchain/core/utils/env');
var _enum = require('../common/enum.cjs');

dotenv.config();
const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
const getCodeBaseURL = () => env.getEnvironmentVariable(_enum.EnvVar.CODE_BASEURL) ?? _enum.Constants.OFFICIAL_CODE_BASEURL;
const imageMessage = ' - the image is already displayed to the user';
const otherMessage = ' - the file is already downloaded by the user';
const CodeExecutionToolSchema = zod.z.object({
    lang: zod.z.enum([
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
- Input code **IS ALREADY** displayed to the user, so **DO NOT** repeat it in your response unless asked.
- Output code **IS NOT** displayed to the user, so **DO** write all desired output explicitly.
- IMPORTANT: You MUST explicitly print/output ALL results you want the user to see.
- py: This is not a Jupyter notebook environment. Use \`print()\` for all outputs.
- py: Matplotlib: Use \`plt.savefig()\` to save plots as files.
- js: use the \`console\` or \`process\` methods for all outputs.
- r: IMPORTANT: No X11 display available. ALL graphics MUST use Cairo library (library(Cairo)).
- Other languages: use appropriate output functions.`),
    args: zod.z.array(zod.z.string()).optional()
        .describe('Additional arguments to execute the code with. This should only be used if the input code requires additional arguments to run.'),
});
const EXEC_ENDPOINT = `${getCodeBaseURL()}/run`;
function createCodeExecutionTool(params = {}) {
    const apiKey = params[_enum.EnvVar.CODE_API_KEY] ?? params.apiKey ?? env.getEnvironmentVariable(_enum.EnvVar.CODE_API_KEY) ?? '';
    const userEmail = params.user_email
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
    return tools.tool(async ({ lang, code, ...rest }) => {
        const postData = {
            user_email:userEmail,
            language:lang,
            code,
            ...rest,
            ...params,
        };
        try {
            const response = await fetch("http://intelewriter-open-interpreter:8000/run", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'LibreChat/1.0',
                    'X-API-Key': apiKey,
                },
                body: JSON.stringify(postData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log(result)
            let formattedOutput = '';
            if (result.output[0].content) {
                formattedOutput += `stdout:\n${result.output[0].content}\n`;
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