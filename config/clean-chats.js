#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { Conversation, Message, File, Agent, Assistant } = require('@librechat/data-schemas').createModels(mongoose);
const { FileContext } = require('librechat-data-provider');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

// Intelequia logging configuration
const INTELEQUIA_LOG_DIR = path.join(__dirname, 'int-clean-cron', 'logs');
const INTELEQUIA_LOG_FILE = path.join(INTELEQUIA_LOG_DIR, 'intelewriter-cleanup.log');

/**
 * Intelequia logging function
 */
async function inteleLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;

  try {
    await fs.mkdir(INTELEQUIA_LOG_DIR, { recursive: true });
    await fs.appendFile(INTELEQUIA_LOG_FILE, logEntry + '\n');
  } catch (error) {
    console.error(`Error writing to Intelequia log: ${error.message}`);
  }
}

/**
 * Get all file IDs that are currently in use by agents and assistants
 * @returns {Promise<Set<string>>} Set of file IDs in use
 */
async function getFilesInUseByAgentsAndAssistants() {
  const filesInUse = new Set();

  try {
    // Get file IDs from Agents tool_resources
    const agents = await Agent.find({}, { 'tool_resources': 1 }).lean();
    agents.forEach(agent => {
      if (agent.tool_resources) {
        Object.values(agent.tool_resources).forEach(resource => {
          if (resource && resource.file_ids && Array.isArray(resource.file_ids)) {
            resource.file_ids.forEach(fileId => filesInUse.add(fileId));
          }
        });
      }
    });

    // Get file IDs from Assistants
    const assistants = await Assistant.find({}, { 'file_ids': 1, 'tool_resources': 1 }).lean();
    assistants.forEach(assistant => {
      // Direct file_ids on assistant
      if (assistant.file_ids && Array.isArray(assistant.file_ids)) {
        assistant.file_ids.forEach(fileId => filesInUse.add(fileId));
      }

      // file_ids in tool_resources
      if (assistant.tool_resources) {
        Object.values(assistant.tool_resources).forEach(resource => {
          if (resource && resource.file_ids && Array.isArray(resource.file_ids)) {
            resource.file_ids.forEach(fileId => filesInUse.add(fileId));
          }
        });
      }
    });

    console.cyan(`Found ${filesInUse.size} files currently in use by agents and assistants`);
    return filesInUse;
  } catch (error) {
    console.yellow(`⚠ Warning: Could not fetch files in use by agents/assistants: ${error.message}`);
    return new Set(); // Return empty set to be safe
  }
}

async function gracefulExit(code = 0) {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error disconnecting from MongoDB:', err);
  }
  silentExit(code);
}

/**
 * Recursively get file stats and calculate total size
 * @param {string} dirPath - Directory path
 * @returns {Promise<{count: number, size: number}>}
 */
async function getDirectoryStats(dirPath) {
  let totalCount = 0;
  let totalSize = 0;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subStats = await getDirectoryStats(fullPath);
        totalCount += subStats.count;
        totalSize += subStats.size;
      } else {
        try {
          const stats = await fs.stat(fullPath);
          totalCount++;
          totalSize += stats.size;
        } catch (error) {
          // Ignore individual file errors
        }
      }
    }
  } catch (error) {
    // Ignore directory access errors
  }

  return { count: totalCount, size: totalSize };
}

/**
 * Recursively delete old files in directory
 * @param {string} dirPath - Directory path
 * @param {Date} cutoffDate - Files older than this date will be deleted
 * @returns {Promise<{count: number, size: number}>}
 */
async function deleteOldFiles(dirPath, cutoffDate) {
  let deletedCount = 0;
  let deletedSize = 0;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subStats = await deleteOldFiles(fullPath, cutoffDate);
        deletedCount += subStats.count;
        deletedSize += subStats.size;

        // Try to remove empty directory
        try {
          const remainingEntries = await fs.readdir(fullPath);
          if (remainingEntries.length === 0) {
            await fs.rmdir(fullPath);
          }
        } catch (error) {
          // Ignore if directory is not empty or other errors
        }
      } else {
        try {
          const stats = await fs.stat(fullPath);
          if (stats.mtime < cutoffDate) {
            await fs.unlink(fullPath);
            deletedCount++;
            deletedSize += stats.size;
          }
        } catch (error) {
          // Ignore individual file errors
        }
      }
    }
  } catch (error) {
    // Ignore directory access errors
  }

  return { count: deletedCount, size: deletedSize };
}

/**
 * Format bytes to human readable format
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Read CLEAN_DATA_INTERVAL from .env file
 * @returns {number|null} Number of days or null if invalid/not found
 */
function getCleanDataIntervalFromEnv() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    const match = envContent.match(/^CLEAN_DATA_INTERVAL\s*=\s*(.*)$/m);

    if (!match || !match[1] || match[1].trim() === '') {
      console.yellow('⚠️  CLEAN_DATA_INTERVAL is empty or not found in .env file.');
      console.yellow('   No automatic cleanup will be performed.');
      return null;
    }

    let rawValue = match[1].trim();

    // Remove inline comments (everything after # or //)
    rawValue = rawValue.split(/\s+#/)[0].trim();
    rawValue = rawValue.split(/\s+\/\//)[0].trim();

    // Remove quotes if present
    const cleanValue = rawValue.replace(/^["']|["']$/g, '');

    // Validate it's a number
    if (!/^\d+$/.test(cleanValue)) {
      console.yellow(`⚠️  CLEAN_DATA_INTERVAL value "${rawValue}" is not a valid number.`);
      console.yellow('   Expected format: CLEAN_DATA_INTERVAL=90');
      return null;
    }

    const days = parseInt(cleanValue, 10);

    if (isNaN(days) || days <= 0) {
      console.yellow(`⚠️  CLEAN_DATA_INTERVAL value "${rawValue}" resulted in invalid number: ${days}`);
      return null;
    }

    if (days < 30) {
      console.red('🚨 SAFETY ERROR: CLEAN_DATA_INTERVAL from .env file is less than 30 days!');
      console.red(`   Current value: ${days} days`);
      console.red('   Minimum allowed: 30 days');
      console.red('   This prevents accidental deletion of recent data.');
      return null;
    }

    return days;
  } catch (error) {
    console.yellow(`⚠️  Error reading .env file: ${error.message}`);
    return null;
  }
}

/**
 * Get sample data from collections for detailed console output
 * @param {Date} cutoffDate - Cutoff date for filtering
 * @returns {Object} Sample data from each collection
 */
async function getSampleDataForDisplay(cutoffDate) {
  try {
    // Only get conversations that are NOT archived
    const sampleConversations = await Conversation.find({
      updatedAt: { $lt: cutoffDate },
      $or: [
        { isArchived: { $exists: false } },
        { isArchived: false }
      ]
    }).select('conversationId title user updatedAt endpoint isArchived').limit(10).lean();

    // Get messages from the conversations that will be deleted
    const conversationIds = sampleConversations.map(conv => conv.conversationId);
    const sampleMessages = conversationIds.length > 0 ? await Message.find({
      conversationId: { $in: conversationIds }
    }).select('messageId conversationId user createdAt text').limit(10).lean() : [];

    // NOTE: File samples will be overridden in the main function with safe-to-delete files only
    const sampleFiles = await File.find({
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment
    }).select('file_id filename user createdAt size type context').limit(10).lean();

    return {
      conversations: sampleConversations,
      messages: sampleMessages,
      files: sampleFiles
    };
  } catch (error) {
    console.yellow(`⚠ Warning: Could not fetch sample data: ${error.message}`);
    return {
      conversations: [],
      messages: [],
      files: []
    };
  }
}

/**
 * Display detailed information about what will be deleted
 * @param {Object} sampleData - Sample data to display
 * @param {Date} cutoffDate - Cutoff date
 */
function displayDetailedInfo(sampleData, cutoffDate) {
  console.white('');
  console.cyan('📋 Detailed Information:');
  console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (sampleData.conversations.length > 0) {
    console.yellow('🗨️  Sample Conversations to be deleted:');
    sampleData.conversations.forEach((conv, index) => {
      const date = conv.updatedAt ? new Date(conv.updatedAt).toISOString().split('T')[0] : 'Unknown';
      console.gray(`   ${index + 1}. ID: ${conv.conversationId}`);
      console.gray(`      Title: "${conv.title || 'No title'}"`);
      console.gray(`      User: ${conv.user || 'Unknown'}`);
      console.gray(`      Last Update: ${date}`);
      console.gray(`      Endpoint: ${conv.endpoint || 'Unknown'}`);
      console.white('');
    });
  }

  if (sampleData.messages.length > 0) {
    console.yellow('💬 Sample Messages to be deleted:');
    sampleData.messages.forEach((msg, index) => {
      const date = msg.createdAt ? new Date(msg.createdAt).toISOString().split('T')[0] : 'Unknown';
      const preview = msg.text ? msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : '') : 'No text';
      console.gray(`   ${index + 1}. ID: ${msg.messageId}`);
      console.gray(`      Conversation: ${msg.conversationId}`);
      console.gray(`      User: ${msg.user || 'Unknown'}`);
      console.gray(`      Created: ${date}`);
      console.gray(`      Preview: "${preview}"`);
      console.white('');
    });
  }

  if (sampleData.files.length > 0) {
    console.yellow('📎 Sample USER FILE RECORDS to be deleted (message attachments only):');
    sampleData.files.forEach((file, index) => {
      const date = file.createdAt ? new Date(file.createdAt).toISOString().split('T')[0] : 'Unknown';
      const size = file.size ? formatBytes(file.size) : 'Unknown size';
      console.gray(`   ${index + 1}. ID: ${file.file_id}`);
      console.gray(`      Filename: ${file.filename || 'Unknown'}`);
      console.gray(`      User: ${file.user || 'Unknown'}`);
      console.gray(`      Created: ${date}`);
      console.gray(`      Size: ${size}`);
      console.gray(`      Type: ${file.type || 'Unknown'}`);
      console.gray(`      Context: ${file.context || 'Unknown'} (SAFE TO DELETE)`);
      console.white('');
    });
  }

  console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Script to clean old chat conversations, messages, and user-uploaded files
 * 
 * SAFETY FEATURES:
 * - NEVER deletes archived chats and their messages (regardless of age)
 * - NEVER deletes agent files (regardless of age)
 * - NEVER deletes assistant files (regardless of age) 
 * - NEVER deletes system files
 * - Only deletes user message attachment files older than specified days
 * - Protects files currently in use by any agent or assistant
 * - Messages remain if their conversation is still active (not deleted)
 * - Minimum retention period is 30 days to prevent accidental data loss
 * 
 * Usage: node config/clean-chats.js [days] [-y]
 * Options:
 *   days: Number of days (if not provided, reads from CLEAN_DATA_INTERVAL in .env)
 *   -y: Auto-confirm deletion without asking
 * 
 * Examples:
 *   node config/clean-chats.js           # Clean using CLEAN_DATA_INTERVAL from .env
 *   node config/clean-chats.js 180       # Clean data older than 180 days
 *   node config/clean-chats.js 30 -y     # Clean data older than 30 days (minimum) with auto-confirm
 *   node config/clean-chats.js -y        # Clean using .env value with auto-confirm
 */
(async () => {
  await connect();

  console.purple('---------------');
  console.purple('LibreChat Chat Cleaner');
  console.purple('---------------');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let days = null; // Will be determined from args or .env
  let autoConfirm = false;
  let daysFromArgs = false;

  // Parse arguments
  for (const arg of args) {
    if (arg === '-y' || arg === '--yes') {
      autoConfirm = true;
    } else if (!isNaN(parseInt(arg))) {
      days = parseInt(arg);
      daysFromArgs = true;
    }
  }

  // If no days provided via arguments, try to get from .env
  if (!daysFromArgs) {
    console.cyan('No days argument provided, checking CLEAN_DATA_INTERVAL in .env...');
    days = getCleanDataIntervalFromEnv();

    if (days === null) {
      console.red('');
      console.red('❌ Unable to determine cleanup interval.');
      console.red('');
      console.yellow('Options:');
      console.yellow('1. Provide days as argument: node config/clean-chats.js 90');
      console.yellow('2. Set CLEAN_DATA_INTERVAL in .env file: CLEAN_DATA_INTERVAL=90');
      console.yellow('');
      return gracefulExit(0);
    }

    console.green(`✓ Using CLEAN_DATA_INTERVAL from .env: ${days} days`);
  } else {
    console.cyan(`Using days from command line argument: ${days}`);
  }

  // Safety validation: minimum 30 days to prevent accidental deletion of recent data
  if (days <= 0) {
    console.red('Error: Days must be a positive number');
    return gracefulExit(1);
  }

  if (days < 30) {
    console.red('🚨 SAFETY ERROR: Minimum retention period is 30 days!');
    console.red('   This prevents accidental deletion of recent data.');
    console.red('   If you really need to delete data newer than 30 days,');
    console.red('   please modify the script manually.');
    console.red('');
    console.yellow('   Suggested values:');
    console.yellow('   • 30 days  - Minimum allowed');
    console.yellow('   • 90 days  - Default (3 months)');
    console.yellow('   • 180 days - 6 months');
    console.yellow('   • 365 days - 1 year');
    return gracefulExit(1);
  }

  // Calculate the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  console.cyan(`Configuration:`);
  console.white(`  • Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${days} days ago)`);
  console.white(`  • Current date: ${new Date().toISOString().split('T')[0]}`);
  console.white(`  • Auto-confirm: ${autoConfirm ? 'Yes' : 'No'}`);
  console.white('');

  try {
    // First, count what will be deleted
    console.cyan('Analyzing data...');

    // Get files currently in use by agents and assistants
    const filesInUse = await getFilesInUseByAgentsAndAssistants();

    const conversationQuery = {
      updatedAt: { $lt: cutoffDate },
      $or: [
        { isArchived: { $exists: false } },
        { isArchived: false }
      ]
    };

    const conversationCount = await Conversation.countDocuments(conversationQuery);

    // Count archived conversations that are protected (old enough to delete BUT archived)
    const archivedCount = await Conversation.countDocuments({
      updatedAt: { $lt: cutoffDate },
      isArchived: true
    });

    // Count protected files (old enough to delete BUT used by agents/assistants)
    const protectedFilesCount = await File.countDocuments({
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      file_id: { $in: Array.from(filesInUse) }
    });

    // Get conversation IDs to find related messages
    const conversationsToDelete = await Conversation.find(conversationQuery)
      .select('conversationId').lean();

    const conversationIds = conversationsToDelete.map(conv => conv.conversationId);

    const messageCount = conversationIds.length > 0 ? await Message.countDocuments({
      conversationId: { $in: conversationIds }
    }) : 0;

    // Only count files that are safe to delete:
    // 1. Files older than cutoff date
    // 2. With context 'message_attachment' (user uploaded files)
    // 3. NOT in use by any agent or assistant
    const safeToDeleteFileQuery = {
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      file_id: { $nin: Array.from(filesInUse) }
    };

    const fileCount = await File.countDocuments(safeToDeleteFileQuery);

    // Get sample of files that will be deleted for display
    const sampleFilesToDelete = await File.find(safeToDeleteFileQuery)
      .select('file_id filename user createdAt size type context')
      .limit(10)
      .lean();

    // Check uploaded files in filesystem (we'll be more careful here too)
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const uploadsStats = await getDirectoryStats(uploadsPath);

    if (conversationCount === 0 && fileCount === 0 && uploadsStats.count === 0) {
      console.green(`✔ No data older than ${days} days found for safe deletion.`);
      console.white('');
      console.cyan('📋 Safety Summary:');
      console.white(`  • Archived chats protected: ${archivedCount.toLocaleString()} (would be deleted but archived)`);
      console.white(`  • Protected files (agents/assistants): ${protectedFilesCount.toLocaleString()} (would be deleted but in use)`);
      console.white(`  • Total files in use: ${filesInUse.size.toLocaleString()}`);
      console.white(`  • Archived chats are permanently protected (never deleted)`);
      console.white(`  • Only user-uploaded message attachments are considered for deletion`);
      console.white(`  • Agent and assistant files are never deleted regardless of age`);

      // Intelequia logging when no data to delete
      try {
        await inteleLog('========================================');
        await inteleLog('Intelequia cleanup job completed - no data to delete');
        await inteleLog(`STATS: Chats deleted: 0 | Messages deleted: 0 | Files deleted: 0`);
        await inteleLog(`PROTECTED: Archived chats: ${archivedCount} (would be deleted but archived) | Protected files: ${protectedFilesCount} (would be deleted but in use by agents/assistants)`);
        await inteleLog(`CONFIG: Cleanup interval: ${days} days`);
        await inteleLog(`DETAILS: Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
        await inteleLog('========================================');
      } catch (logError) {
        console.yellow(`⚠️ Warning: Could not write to Intelequia log: ${logError.message}`);
      }

      return gracefulExit(0);
    }

    console.yellow(`Found data to clean (SAFE USER DATA ONLY):`);
    console.white(`  • Database:`);
    console.white(`    - Conversations: ${conversationCount.toLocaleString()}`);
    console.white(`    - Messages (in old conversations): ${messageCount.toLocaleString()}`);
    console.white(`    - User file records (message attachments): ${fileCount.toLocaleString()}`);
    console.white(`  • File system:`);
    console.white(`    - Upload files (total, will filter safely): ${uploadsStats.count.toLocaleString()} (${formatBytes(uploadsStats.size)})`);
    console.white('');
    console.green(`🛡️  PROTECTION SUMMARY:`);
    console.white(`    - Archived chats protected: ${archivedCount.toLocaleString()} (would be deleted but archived)`);
    console.white(`    - Protected files (agents/assistants): ${protectedFilesCount.toLocaleString()} (would be deleted but in use)`);
    console.white(`    - Total files in use by agents/assistants: ${filesInUse.size.toLocaleString()}`);
    console.white('');
    console.yellow(`📝 PROTECTION DETAILS:`);
    console.white(`    - Archived chats: NEVER DELETED (remain forever)`);
    console.white(`    - Agent/assistant files: NEVER DELETED (regardless of age)`);
    console.white(`    - System files: NEVER DELETED`);
    console.white(`    - Only deleting: User message attachment files older than ${days} days`);

    // Get and display detailed sample data with updated file samples
    const sampleData = await getSampleDataForDisplay(cutoffDate);
    sampleData.files = sampleFilesToDelete; // Override with safe-to-delete files
    displayDetailedInfo(sampleData, cutoffDate);

    // Ask for confirmation unless auto-confirm is enabled
    if (!autoConfirm) {
      const confirmMsg = `Are you sure you want to remove OLD USER DATA (conversations, messages, and user-uploaded files) older than ${days} days? This action cannot be undone.

🛡️  PROTECTED DATA (NEVER DELETED):
   • Archived chats and their messages (regardless of age)
   • Agent files (regardless of age)
   • Assistant files (regardless of age)  
   • System files
   • Files currently in use by agents/assistants

❌ WILL BE DELETED:
   • Conversations older than ${days} days
   • Messages in old conversations
   • User message attachment files older than ${days} days (not used by agents/assistants)

Continue? (y/N)`;
      const confirmation = await askQuestion(confirmMsg);

      if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
        console.yellow('Operation cancelled.');
        return gracefulExit(0);
      }
    } else {
      console.cyan('Auto-confirm enabled, proceeding with SAFE deletion (agents/assistants protected)...');
    }

    console.orange('Starting cleanup process...');
    console.white('');

    // Re-fetch files in use to ensure we have the latest data
    const filesInUseForDeletion = await getFilesInUseByAgentsAndAssistants();

    // First, get the conversation IDs that will be deleted
    // Only delete conversations that are NOT archived
    const conversationQueryForDeletion = {
      updatedAt: { $lt: cutoffDate },
      $or: [
        { isArchived: { $exists: false } },
        { isArchived: false }
      ]
    };

    const conversationsForDeletion = await Conversation.find(conversationQueryForDeletion)
      .select('conversationId').lean();

    const conversationIdsForDeletion = conversationsForDeletion.map(conv => conv.conversationId);

    // Delete messages that belong to old conversations
    let messageResult = { deletedCount: 0 };
    if (conversationIdsForDeletion.length > 0) {
      console.cyan('Deleting messages from old conversations...');
      messageResult = await Message.deleteMany({
        conversationId: { $in: conversationIdsForDeletion }
      });
      console.green(`✔ Deleted ${messageResult.deletedCount.toLocaleString()} messages from old conversations`);
    }

    // Delete conversations older than cutoff date (but NOT archived)
    console.cyan('Deleting old conversations (excluding archived)...');
    const conversationResult = await Conversation.deleteMany(conversationQueryForDeletion);
    console.green(`✔ Deleted ${conversationResult.deletedCount.toLocaleString()} conversations (archived chats protected)`);

    // Delete ONLY safe user file records (message attachments not in use by agents/assistants)
    console.cyan('Deleting old user file records (message attachments only)...');
    const safeFileDeleteQuery = {
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      file_id: { $nin: Array.from(filesInUseForDeletion) }
    };

    const fileResult = await File.deleteMany(safeFileDeleteQuery);
    console.green(`✔ Deleted ${fileResult.deletedCount.toLocaleString()} user file records (agents/assistants files protected)`);

    // For file system cleanup, we need to be more careful
    // We'll only delete files that correspond to deleted file records
    console.cyan('Deleting corresponding uploaded files from filesystem...');

    // Get the file records that were actually deleted to know which physical files to remove
    const deletedFileRecords = await File.find({
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      file_id: { $nin: Array.from(filesInUseForDeletion) }
    }).select('filepath filename file_id').lean();

    let deletedFilesCount = 0;
    let deletedFilesSize = 0;

    // Delete specific files based on the deleted records
    for (const fileRecord of deletedFileRecords) {
      if (fileRecord.filepath) {
        try {
          const fullPath = path.join(__dirname, '..', fileRecord.filepath.replace(/^\//, ''));
          const stats = await fs.stat(fullPath);
          await fs.unlink(fullPath);
          deletedFilesCount++;
          deletedFilesSize += stats.size;
        } catch (error) {
          // File might not exist or be inaccessible, which is fine
        }
      }
    }

    // Also clean up old files by date, but be more conservative
    console.cyan('Cleaning up old orphaned files by date...');
    const additionalDeleted = await deleteOldFiles(uploadsPath, cutoffDate);
    deletedFilesCount += additionalDeleted.count;
    deletedFilesSize += additionalDeleted.size;

    console.green(`✔ Deleted ${deletedFilesCount.toLocaleString()} files (${formatBytes(deletedFilesSize)})`);

    console.white('');
    console.green('🎉 Cleanup completed successfully!');
    console.white('');

    // Recalculate protected files count for final summary
    const finalProtectedFilesCount = await File.countDocuments({
      createdAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      file_id: { $in: Array.from(filesInUseForDeletion) }
    });

    // Detailed summary with all information
    console.cyan('📊 COMPLETE CLEANUP SUMMARY:');
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.green(`✅ Operation completed at: ${new Date().toISOString()}`);
    console.green(`⏰ Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${days} days ago)`);
    console.white('');
    console.yellow('🗂️  Database Cleanup Results:');
    console.white(`   • Conversations deleted: ${conversationResult.deletedCount.toLocaleString()}`);
    console.white(`   • Messages deleted: ${messageResult.deletedCount.toLocaleString()}`);
    console.white(`   • User file records deleted: ${fileResult.deletedCount.toLocaleString()}`);
    console.white('');
    console.yellow('💾 File System Cleanup Results:');
    console.white(`   • Physical files deleted: ${deletedFilesCount.toLocaleString()}`);
    console.white(`   • Disk space freed: ${formatBytes(deletedFilesSize)}`);
    console.white('');
    console.green('🛡️  PROTECTION SUMMARY:');
    console.white(`   • Archived chats protected: ${archivedCount.toLocaleString()} (would be deleted but archived)`);
    console.white(`   • Protected files (agents/assistants): ${finalProtectedFilesCount.toLocaleString()} (would be deleted but in use)`);
    console.white(`   • Total files in use: ${filesInUseForDeletion.size.toLocaleString()}`);
    console.white('');
    console.yellow('📝 PROTECTION DETAILS:');
    console.white(`   • Archived chats: NEVER DELETED (protected)`);
    console.white(`   • Agent files: NEVER DELETED (protected)`);
    console.white(`   • Assistant files: NEVER DELETED (protected)`);
    console.white(`   • System files: NEVER DELETED (protected)`);
    console.white(`   • Only deleted: User message attachments older than ${days} days`);
    console.white('');
    console.yellow('📈 Total Impact:');
    const totalItems = conversationResult.deletedCount + messageResult.deletedCount + fileResult.deletedCount + deletedFilesCount;
    console.white(`   • Total items removed: ${totalItems.toLocaleString()}`);
    console.white(`   • Total space saved: ${formatBytes(deletedFilesSize)}`);
    console.white(`   • Auto-confirm mode: ${autoConfirm ? 'Enabled' : 'Disabled'}`);
    console.white(`   • Safety mode: ENABLED (archived chats and agent files protected)`);
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Intelequia logging with specific requested statistics
    try {
      await inteleLog('========================================');
      await inteleLog('Intelequia cleanup job completed successfully');
      await inteleLog(`STATS: Chats deleted: ${conversationResult.deletedCount} | Messages deleted: ${messageResult.deletedCount} | Files deleted: ${deletedFilesCount}`);
      await inteleLog(`PROTECTED: Archived chats: ${archivedCount} (would be deleted but archived) | Protected files: ${finalProtectedFilesCount} (would be deleted but in use by agents/assistants)`);
      await inteleLog(`CONFIG: Cleanup interval: ${days} days`);
      await inteleLog(`DETAILS: Cutoff date: ${cutoffDate.toISOString().split('T')[0]} | Space freed: ${formatBytes(deletedFilesSize)}`);
      await inteleLog('========================================');
    } catch (logError) {
      console.yellow(`⚠️ Warning: Could not write to Intelequia log: ${logError.message}`);
    }

  } catch (error) {
    console.red('Error during cleanup:');
    console.error(error);
    console.white('');
    console.red('❌ CLEANUP FAILED');
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.red(`⚠️  Error occurred at: ${new Date().toISOString()}`);
    console.red(`🎯 Attempted cutoff date: ${cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'N/A'} (${days} days ago)`);
    console.red(`📝 Error message: ${error.message}`);
    console.yellow('🛡️  Note: Archived chats, agent and assistant files remain protected regardless of errors');
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Intelequia logging for errors
    try {
      await inteleLog('========================================');
      await inteleLog('Intelequia cleanup job FAILED');
      await inteleLog(`ERROR: ${error.message}`);
      await inteleLog(`CONFIG: Cleanup interval: ${days} days`);
      await inteleLog(`DETAILS: Attempted cutoff date: ${cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'N/A'}`);
      await inteleLog('========================================');
    } catch (logError) {
      console.yellow(`⚠️ Warning: Could not write to Intelequia log: ${logError.message}`);
    }

    return gracefulExit(1);
  }

  return gracefulExit(0);
})().catch(async (err) => {
  if (!err.message.includes('fetch failed')) {
    console.red('There was an uncaught error:');
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
});
