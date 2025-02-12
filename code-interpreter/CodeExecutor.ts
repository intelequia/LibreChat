import { z } from 'zod';
import { config } from 'dotenv';
import { tool, DynamicStructuredTool } from '@langchain/core/tools';
import { getEnvironmentVariable } from '@langchain/core/utils/env';
import type * as t from '@/types';
import { EnvVar, Constants } from '@/common';

config();

export const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
export const getCodeBaseURL = (): string => getEnvironmentVariable(EnvVar.CODE_BASEURL) ?? Constants.OFFICIAL_CODE_BASEURL;

const imageMessage = ' - the image is already displayed to the user';
const otherMessage = ' - the file is already downloaded by the user';

const CodeExecutionToolSchema = z.object({
  lang: z.enum([
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
  code: z.string()
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
  args: z.array(z.string()).optional()
    .describe('Additional arguments to execute the code with. This should only be used if the input code requires additional arguments to run.'),
});

const EXEC_ENDPOINT = `${getCodeBaseURL()}`;

function createCodeExecutionTool(params: t.CodeExecutionToolParams = {}): DynamicStructuredTool<typeof CodeExecutionToolSchema> {
  const apiKey = params[EnvVar.CODE_API_KEY] ?? params.apiKey ?? getEnvironmentVariable(EnvVar.CODE_API_KEY) ?? '';
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

  return tool<typeof CodeExecutionToolSchema>(
    async ({ lang, code, ...rest }) => {
      const postData = {
        lang,
        code,
        ...rest,
        ...params,
      };

      try {
        const response = await fetch(EXEC_ENDPOINT, {
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

        const result: t.ExecuteResult = await response.json();
        let formattedOutput = '';
        if (result.stdout) {
          formattedOutput += `stdout:\n${result.stdout}\n`;
        } else {
          formattedOutput += 'stdout: Empty. Ensure you\'re writing output explicitly.\n';
        }
        if (result.stderr) formattedOutput += `stderr:\n${result.stderr}\n`;
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
      } catch (error) {
        return [`Execution error:\n\n${(error as Error | undefined)?.message}`, {}];
      }
    },
    {
      name: Constants.EXECUTE_CODE,
      description,
      schema: CodeExecutionToolSchema,
      responseFormat: Constants.CONTENT_AND_ARTIFACT,
    }
  );
}

export { createCodeExecutionTool };