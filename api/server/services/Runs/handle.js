const { sleep } = require('@librechat/agents');
const { logger } = require('@librechat/data-schemas');
const { RunStatus, CacheKeys } = require('librechat-data-provider');
const getLogStores = require('~/cache/getLogStores');
const { retrieveRun } = require('./methods');

async function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutHandle;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      logger.debug(timeoutMessage);
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function createRun({ openai, thread_id, body }) {
  return await openai.beta.threads.runs.create(thread_id, body);
}

/**
 * Waits for a run to complete by repeatedly checking its status. It uses a RunManager instance to fetch and manage run steps based on the run status.
 *
 * @param {Object} params - The parameters for the waitForRun function.
 * @param {OpenAIClient} params.openai - The OpenAI client instance.
 * @param {string} params.run_id - The ID of the run to wait for.
 * @param {string} params.thread_id - The ID of the thread associated with the run.
 * @param {RunManager} params.runManager - The RunManager instance to manage run steps.
 * @param {number} [params.pollIntervalMs=2000] - The interval for polling the run status; default is 2000 milliseconds.
 * @param {number} [params.timeout=180000] - The period to wait until timing out polling; default is 3 minutes (in ms).
 * @return {Promise<Run>} A promise that resolves to the last fetched run object.
 */
async function waitForRun({
  openai,
  run_id,
  thread_id,
  runManager,
  pollIntervalMs = 2000,
  timeout = 60000 * 3,
}) {
  pollIntervalMs = 500;
  let timeElapsed = 0;
  let run;

  const cache = getLogStores(CacheKeys.ABORT_KEYS);
  const cacheKey = `${openai.req.user.id}:${openai.responseMessage.conversationId}`;

  let i = 0;
  let lastSeenStatus = null;
  const runIdLog = `run_id: ${run_id}`;
  const runInfo = `user: ${openai.req.user.id} | thread_id: ${thread_id} | ${runIdLog}`;
  const raceTimeoutMs = 3000;
  let maxRetries = 5;
  while (timeElapsed < timeout) {
    i++;
    logger.debug(`[heartbeat ${i}] ${runIdLog} | Retrieving run status...`);
    let updatedRun;

    let attempt = 0;
    let startTime = Date.now();
    while (!updatedRun && attempt < maxRetries) {
      try {
        updatedRun = await withTimeout(
          retrieveRun({ thread_id, run_id, timeout: raceTimeoutMs, openai }),
          raceTimeoutMs,
          `[heartbeat ${i}] ${runIdLog} | Run retrieval timed out after ${raceTimeoutMs} ms. Trying again (attempt ${attempt + 1
          } of ${maxRetries})...`,
        );
        const endTime = Date.now();
        logger.debug(
          `[heartbeat ${i}] ${runIdLog} | Elapsed run retrieval time: ${endTime - startTime}`,
        );
      } catch (error) {
        attempt++;
        startTime = Date.now();
        logger.warn(`${runIdLog} | Error retrieving run status`, error);
      }
    }

    if (!updatedRun) {
      const errorMessage = `[waitForRun] ${runIdLog} | Run retrieval failed after ${maxRetries} attempts`;
      throw new Error(errorMessage);
    }

    run = updatedRun;
    attempt = 0;
    const runStatus = `${runInfo} | status: ${run.status}`;

    if (run.status !== lastSeenStatus) {
      logger.debug(`[${run.status}] ${runInfo}`);
      lastSeenStatus = run.status;
    }

    logger.debug(`[heartbeat ${i}] ${runStatus}`);

    let cancelStatus;
    try {
      const timeoutMessage = `[heartbeat ${i}] ${runIdLog} | Cancel Status check operation timed out.`;
      cancelStatus = await withTimeout(cache.get(cacheKey), raceTimeoutMs, timeoutMessage);
    } catch (error) {
      logger.warn(`Error retrieving cancel status: ${error}`);
    }

    if (cancelStatus === 'cancelled') {
      logger.warn(`[waitForRun] ${runStatus} | RUN CANCELLED`);
      throw new Error('Run cancelled');
    }
    if (![RunStatus.IN_PROGRESS, RunStatus.QUEUED].includes(run.status)) {
      logger.debug(`[FINAL] ${runInfo} | status: ${run.status}`);
      await runManager.fetchRunSteps({
        openai,
        thread_id: thread_id,
        run_id: run_id,
        runStatus: run.status,
        final: true,
      });
      break;
    }

    // may use in future; for now, just fetch from the final status
    await runManager.fetchRunSteps({
      openai,
      thread_id: thread_id,
      run_id: run_id,
      runStatus: run.status,
    });

    await sleep(pollIntervalMs);
    timeElapsed += pollIntervalMs;
  }

  if (timeElapsed >= timeout) {
    const timeoutMessage = `[waitForRun] ${runInfo} | status: ${run.status} | timed out after ${timeout} ms`;
    logger.warn(timeoutMessage);
    throw new Error(timeoutMessage);
  }

  return run;
}

module.exports = {
  createRun,
  waitForRun,
};
