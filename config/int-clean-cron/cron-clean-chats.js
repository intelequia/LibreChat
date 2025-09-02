#!/usr/bin/env node
const path = require('path');
const { exec } = require('child_process');

/**
 * Script de cron de Intelequia para limpieza automática de chats
 * Ejecuta el comando dentro del contenedor LibreChat usando docker exec
 * El script clean-chats.js se encarga de leer CLEAN_DATA_INTERVAL del .env
 * 
 * Comando: docker exec LibreChat npm run clean-chats -- -y
 */

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function main() {
    log('Intelequia cron cleanup job started (Docker mode)');

    // Ejecutar clean-chats dentro del contenedor LibreChat usando docker exec
    const projectDir = path.join(__dirname, '..', '..');

    // Comando que se ejecutará dentro del contenedor
    const cleanCommand = 'npm run clean-chats -- -y';

    // Comando docker exec que se ejecuta desde el host
    const command = `docker exec LibreChat ${cleanCommand}`;

    log(`Executing in container 'LibreChat': ${cleanCommand}`);
    log(`Full command: ${command}`);

    exec(command, { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) {
            log(`ERROR: ${error.message}`);
            log('Make sure the LibreChat container is running: docker ps | grep LibreChat');
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
