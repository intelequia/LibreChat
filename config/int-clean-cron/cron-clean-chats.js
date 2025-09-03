#!/usr/bin/env node
const path = require('path');
const { exec } = require('child_process');

/**
 * Script de cron de Intelequia para limpieza automática de chats
 * MODO INTERNO: Se ejecuta directamente dentro del contenedor LibreChat
 * El script clean-chats.js se encarga de leer CLEAN_DATA_INTERVAL del .env
 * 
 * Comando: npm run clean-chats -- -y (ejecutado internamente)
 */

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function main() {
    log('Intelequia internal cron cleanup job started');

    // Comando que se ejecutará directamente dentro del contenedor
    const command = 'npm run clean-chats -- -y';

    log(`Executing internally: ${command}`);

    exec(command, { cwd: '/app' }, (error, stdout, stderr) => {
        if (error) {
            log(`ERROR: ${error.message}`);
            log('Internal cron execution failed');
            process.exit(1);
        }

        if (stderr) {
            log(`STDERR: ${stderr}`);
        }

        log('Chat cleanup process completed successfully');
        if (stdout) {
            // Solo mostrar las líneas importantes del output
            const lines = stdout.split('\n');
            const importantLines = lines.filter(line =>
                line.includes('✓') ||
                line.includes('❌') ||
                line.includes('ERROR') ||
                line.includes('SAFETY') ||
                line.includes('Using CLEAN_DATA_INTERVAL') ||
                line.includes('Unable to determine') ||
                line.includes('completed successfully') ||
                line.includes('No data older than') ||
                line.includes('PROTECTION SUMMARY') ||
                line.includes('COMPLETE CLEANUP SUMMARY')
            );
            importantLines.forEach(line => log(`OUTPUT: ${line.trim()}`));
        }
        process.exit(0);
    });
}

main();
