const fs = require('fs').promises;
const path = require('path');
const { FileContext, FileSources } = require('librechat-data-provider');

const localFileSources = new Set([FileSources.local, FileSources.text]);

function isWithinRoot(root, candidate) {
  const relativePath = path.relative(root, candidate);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function resolveLocalFilePath(fileRecord, { uploadsPath, imagesPath }) {
  if (
    !fileRecord ||
    !localFileSources.has(fileRecord.source) ||
    typeof fileRecord.filepath !== 'string' ||
    fileRecord.filepath.includes('\\') ||
    fileRecord.filepath.includes('?') ||
    fileRecord.filepath.includes('#')
  ) {
    return null;
  }

  const roots = [
    { prefix: '/uploads/', rootPath: uploadsPath },
    { prefix: '/images/', rootPath: imagesPath },
  ];
  const matchedRoot = roots.find(({ prefix }) => fileRecord.filepath.startsWith(prefix));
  if (!matchedRoot) {
    return null;
  }

  const relativePath = fileRecord.filepath.slice(matchedRoot.prefix.length);
  const pathSegments = relativePath.split('/');
  if (pathSegments.some((segment) => !segment || segment === '.' || segment === '..')) {
    return null;
  }

  const rootPath = path.resolve(matchedRoot.rootPath);
  const fullPath = path.resolve(rootPath, ...pathSegments);
  if (!isWithinRoot(rootPath, fullPath)) {
    return null;
  }

  return { rootPath, fullPath };
}

function getMessageFileIds(messages) {
  const fileIds = new Set();
  for (const message of messages) {
    if (!Array.isArray(message?.files)) {
      continue;
    }
    for (const file of message.files) {
      if (file?.file_id) {
        fileIds.add(file.file_id);
      }
    }
  }
  return fileIds;
}

function getToolResourceFileIds(toolResources) {
  const fileIds = new Set();
  if (!toolResources || typeof toolResources !== 'object') {
    return fileIds;
  }

  for (const resource of Object.values(toolResources)) {
    if (Array.isArray(resource?.file_ids)) {
      for (const fileId of resource.file_ids) {
        fileIds.add(fileId);
      }
    }
  }
  return fileIds;
}

function buildFileCleanupQuery(cutoffDate, protectedFileIds) {
  return {
    updatedAt: { $lt: cutoffDate },
    context: FileContext.message_attachment,
    source: { $in: [FileSources.local, FileSources.text] },
    'metadata.codeEnvRef': { $exists: false },
    'metadata.codeEnvRefs': { $exists: false },
    'metadata.runFile': { $exists: false },
    file_id: { $nin: Array.from(new Set(protectedFileIds)) },
  };
}

async function deleteEligibleLocalFiles(
  fileRecords,
  { uploadsPath, imagesPath, cutoffDate, fileIdsToDelete, protectedFileIds, deleteFileRecord },
) {
  const deletableFileIds = new Set(fileIdsToDelete);
  const protectedIds = new Set(protectedFileIds);
  const deletedFileRecordIds = [];
  let count = 0;
  let size = 0;
  let missingFileCount = 0;
  let recordsDeletedCount = 0;
  let skippedCount = 0;

  for (const fileRecord of fileRecords) {
    const updatedAt = fileRecord?.updatedAt ? new Date(fileRecord.updatedAt) : null;
    if (
      fileRecord?._id == null ||
      fileRecord.context !== FileContext.message_attachment ||
      fileRecord.metadata?.codeEnvRef != null ||
      fileRecord.metadata?.codeEnvRefs != null ||
      fileRecord.metadata?.runFile != null ||
      !fileRecord.file_id ||
      !deletableFileIds.has(fileRecord.file_id) ||
      protectedIds.has(fileRecord.file_id) ||
      !updatedAt ||
      Number.isNaN(updatedAt.getTime()) ||
      updatedAt >= cutoffDate
    ) {
      skippedCount++;
      continue;
    }

    const localFile = resolveLocalFilePath(fileRecord, { uploadsPath, imagesPath });
    if (!localFile) {
      skippedCount++;
      continue;
    }

    let stats;
    try {
      stats = await fs.lstat(localFile.fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const deleteResult = await deleteFileRecord(fileRecord._id);
        recordsDeletedCount += deleteResult.deletedCount ?? 0;
        missingFileCount++;
        continue;
      }
      skippedCount++;
      continue;
    }

    if (!stats.isFile() || stats.isSymbolicLink() || stats.mtime >= cutoffDate) {
      skippedCount++;
      continue;
    }

    try {
      const [realRootPath, realFilePath] = await Promise.all([
        fs.realpath(localFile.rootPath),
        fs.realpath(localFile.fullPath),
      ]);
      if (!isWithinRoot(realRootPath, realFilePath)) {
        skippedCount++;
        continue;
      }
    } catch (_error) {
      skippedCount++;
      continue;
    }

    try {
      await fs.unlink(localFile.fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const deleteResult = await deleteFileRecord(fileRecord._id);
        recordsDeletedCount += deleteResult.deletedCount ?? 0;
        missingFileCount++;
        continue;
      }
      skippedCount++;
      continue;
    }

    const deleteResult = await deleteFileRecord(fileRecord._id);
    recordsDeletedCount += deleteResult.deletedCount ?? 0;
    deletedFileRecordIds.push(fileRecord._id);
    count++;
    size += stats.size;
  }

  return {
    deletedFileRecordIds,
    count,
    missingFileCount,
    recordsDeletedCount,
    size,
    skippedCount,
  };
}

module.exports = {
  buildFileCleanupQuery,
  deleteEligibleLocalFiles,
  getMessageFileIds,
  getToolResourceFileIds,
  resolveLocalFilePath,
};
