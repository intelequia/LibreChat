#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { Conversation, Message, File } = require('@librechat/data-schemas').createModels(mongoose);
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

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
 * Get sample data from collections for detailed console output
 * @param {Date} cutoffDate - Cutoff date for filtering
 * @returns {Object} Sample data from each collection
 */
async function getSampleDataForDisplay(cutoffDate) {
  try {
    const sampleConversations = await Conversation.find({
      updatedAt: { $lt: cutoffDate }
    }).select('conversationId title user updatedAt endpoint').limit(10).lean();

    // Get messages from the conversations that will be deleted
    const conversationIds = sampleConversations.map(conv => conv.conversationId);
    const sampleMessages = conversationIds.length > 0 ? await Message.find({
      conversationId: { $in: conversationIds }
    }).select('messageId conversationId user createdAt text').limit(10).lean() : [];

    const sampleFiles = await File.find({
      createdAt: { $lt: cutoffDate }
    }).select('file_id filename user createdAt size type').limit(10).lean();

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
    console.yellow('📎 Sample File Records to be deleted:');
    sampleData.files.forEach((file, index) => {
      const date = file.createdAt ? new Date(file.createdAt).toISOString().split('T')[0] : 'Unknown';
      const size = file.size ? formatBytes(file.size) : 'Unknown size';
      console.gray(`   ${index + 1}. ID: ${file.file_id}`);
      console.gray(`      Filename: ${file.filename || 'Unknown'}`);
      console.gray(`      User: ${file.user || 'Unknown'}`);
      console.gray(`      Created: ${date}`);
      console.gray(`      Size: ${size}`);
      console.gray(`      Type: ${file.type || 'Unknown'}`);
      console.white('');
    });
  }

  console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Script to clean old chat conversations, messages, and uploaded files
 * Usage: node config/clean-chats.js [days] [-y]
 * Options:
 *   days: Number of days (default: 90, minimum: 30)
 *   -y: Auto-confirm deletion without asking
 * 
 * SAFETY: Minimum retention period is 30 days to prevent accidental data loss
 * 
 * Examples:
 *   node config/clean-chats.js           # Clean data older than 90 days
 *   node config/clean-chats.js 180       # Clean data older than 180 days
 *   node config/clean-chats.js 30 -y     # Clean data older than 30 days (minimum) with auto-confirm
 *   node config/clean-chats.js -y        # Clean data older than 90 days with auto-confirm
 */
(async () => {
  await connect();

  console.purple('---------------');
  console.purple('LibreChat Chat Cleaner');
  console.purple('---------------');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let days = 90; // Default to 90 days (3 months)
  let autoConfirm = false;

  // Parse arguments
  for (const arg of args) {
    if (arg === '-y' || arg === '--yes') {
      autoConfirm = true;
    } else if (!isNaN(parseInt(arg))) {
      days = parseInt(arg);
    }
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

    const conversationCount = await Conversation.countDocuments({
      updatedAt: { $lt: cutoffDate }
    });

    // Get conversation IDs to find related messages
    const conversationsToDelete = await Conversation.find({
      updatedAt: { $lt: cutoffDate }
    }).select('conversationId').lean();

    const conversationIds = conversationsToDelete.map(conv => conv.conversationId);

    const messageCount = conversationIds.length > 0 ? await Message.countDocuments({
      conversationId: { $in: conversationIds }
    }) : 0;

    const fileCount = await File.countDocuments({
      createdAt: { $lt: cutoffDate }
    });

    // Check uploaded files in filesystem
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const uploadsStats = await getDirectoryStats(uploadsPath);

    if (conversationCount === 0 && fileCount === 0 && uploadsStats.count === 0) {
      console.green(`✔ No data older than ${days} days found.`);
      return gracefulExit(0);
    }

    console.yellow(`Found data to clean:`);
    console.white(`  • Database:`);
    console.white(`    - Conversations: ${conversationCount.toLocaleString()}`);
    console.white(`    - Messages (in old conversations): ${messageCount.toLocaleString()}`);
    console.white(`    - File records: ${fileCount.toLocaleString()}`);
    console.white(`  • File system:`);
    console.white(`    - Upload files: ${uploadsStats.count.toLocaleString()} (${formatBytes(uploadsStats.size)})`);

    // Get and display detailed sample data
    const sampleData = await getSampleDataForDisplay(cutoffDate);
    displayDetailedInfo(sampleData, cutoffDate);

    // Ask for confirmation unless auto-confirm is enabled
    if (!autoConfirm) {
      const confirmMsg = `Are you sure you want to remove ALL chat history and files of ALL users older than ${days} days? This action cannot be undone. (y/N)`;
      const confirmation = await askQuestion(confirmMsg);

      if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
        console.yellow('Operation cancelled.');
        return gracefulExit(0);
      }
    } else {
      console.cyan('Auto-confirm enabled, proceeding with deletion...');
    }

    console.orange('Starting cleanup process...');
    console.white('');

    // First, get the conversation IDs that will be deleted
    const conversationsForDeletion = await Conversation.find({
      updatedAt: { $lt: cutoffDate }
    }).select('conversationId').lean();

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

    // Delete conversations older than cutoff date
    console.cyan('Deleting old conversations...');
    const conversationResult = await Conversation.deleteMany({
      updatedAt: { $lt: cutoffDate }
    });
    console.green(`✔ Deleted ${conversationResult.deletedCount.toLocaleString()} conversations`);

    // Delete file records older than cutoff date
    console.cyan('Deleting old file records...');
    const fileResult = await File.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    console.green(`✔ Deleted ${fileResult.deletedCount.toLocaleString()} file records`);

    // Delete uploaded files from filesystem
    console.cyan('Deleting old uploaded files...');
    const deletedFiles = await deleteOldFiles(uploadsPath, cutoffDate);
    console.green(`✔ Deleted ${deletedFiles.count.toLocaleString()} files (${formatBytes(deletedFiles.size)})`);

    console.white('');
    console.green('🎉 Cleanup completed successfully!');
    console.white('');

    // Detailed summary with all information
    console.cyan('📊 COMPLETE CLEANUP SUMMARY:');
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.green(`✅ Operation completed at: ${new Date().toISOString()}`);
    console.green(`⏰ Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${days} days ago)`);
    console.white('');
    console.yellow('🗂️  Database Cleanup Results:');
    console.white(`   • Conversations deleted: ${conversationResult.deletedCount.toLocaleString()}`);
    console.white(`   • Messages deleted: ${messageResult.deletedCount.toLocaleString()}`);
    console.white(`   • File records deleted: ${fileResult.deletedCount.toLocaleString()}`);
    console.white('');
    console.yellow('💾 File System Cleanup Results:');
    console.white(`   • Physical files deleted: ${deletedFiles.count.toLocaleString()}`);
    console.white(`   • Disk space freed: ${formatBytes(deletedFiles.size)}`);
    console.white('');
    console.yellow('📈 Total Impact:');
    const totalItems = conversationResult.deletedCount + messageResult.deletedCount + fileResult.deletedCount + deletedFiles.count;
    console.white(`   • Total items removed: ${totalItems.toLocaleString()}`);
    console.white(`   • Total space saved: ${formatBytes(deletedFiles.size)}`);
    console.white(`   • Auto-confirm mode: ${autoConfirm ? 'Enabled' : 'Disabled'}`);
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.red('Error during cleanup:');
    console.error(error);
    console.white('');
    console.red('❌ CLEANUP FAILED');
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.red(`⚠️  Error occurred at: ${new Date().toISOString()}`);
    console.red(`🎯 Attempted cutoff date: ${cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'N/A'} (${days} days ago)`);
    console.red(`📝 Error message: ${error.message}`);
    console.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
