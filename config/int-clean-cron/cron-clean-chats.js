#!/usr/bin/env node
const { exec } = require('child_process');

/**
 * Intelequia cron script for automatic chat cleanup
 * Executes: npm run clean-chats -- -y
 * Logging is handled directly in clean-chats.js
 */

async function main() {
    console.log(`[${new Date().toISOString()}] Starting Intelequia cleanup cron job...`);

    const command = 'npm run clean-chats -- -y';

    exec(command, { cwd: '/app' }, (error, stdout, stderr) => {
        const timestamp = new Date().toISOString();

        if (error) {
            console.error(`[${timestamp}] ERROR: ${error.message}`);
            process.exit(1);
        }

        if (stderr && stderr.trim()) {
            console.log(`[${timestamp}] STDERR: ${stderr.trim()}`);
        }

        if (stdout) {
            console.log(stdout);
        }

        console.log(`[${timestamp}] Intelequia cleanup cron job completed`);
        process.exit(0);
    });
}

main().catch((error) => {
    console.error(`[${new Date().toISOString()}] FATAL ERROR: ${error.message}`);
    process.exit(1);
});
