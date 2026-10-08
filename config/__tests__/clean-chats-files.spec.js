const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { FileContext, FileSources } = require('librechat-data-provider');
const {
  buildFileCleanupQuery,
  deleteEligibleLocalFiles,
  getMessageFileIds,
  getToolResourceFileIds,
} = require('../clean-chats-files');

const dayInMs = 24 * 60 * 60 * 1000;

describe('clean-chats file cleanup', () => {
  let tempRoot;
  let uploadsPath;
  let imagesPath;
  let cutoffDate;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'clean-chats-files-'));
    uploadsPath = path.join(tempRoot, 'uploads');
    imagesPath = path.join(tempRoot, 'images');
    await Promise.all([
      fs.mkdir(uploadsPath, { recursive: true }),
      fs.mkdir(imagesPath, { recursive: true }),
    ]);
    cutoffDate = new Date(Date.now() - 30 * dayInMs);
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  async function createStoredFile(storedPath, rootPath, modifiedAt) {
    const filePath = path.join(rootPath, storedPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, 'test bytes');
    await fs.utimes(filePath, modifiedAt, modifiedAt);
    return filePath;
  }

  function makeFileRecord(overrides = {}) {
    return {
      _id: 'record-id',
      file_id: 'file-id',
      filepath: '/uploads/user/file.txt',
      source: FileSources.local,
      context: FileContext.message_attachment,
      updatedAt: new Date(cutoffDate.getTime() - dayInMs),
      ...overrides,
    };
  }

  it('deletes only old local attachments selected from deleted conversations', async () => {
    const oldTime = new Date(cutoffDate.getTime() - dayInMs);
    const recentTime = new Date(cutoffDate.getTime() + dayInMs);
    const storedFiles = [
      {
        record: makeFileRecord({
          _id: 'local',
          file_id: 'local-file',
          filepath: '/uploads/user/local.txt',
        }),
        fullPath: await createStoredFile('user/local.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({
          _id: 'image',
          file_id: 'image-file',
          filepath: '/images/user/image.png',
        }),
        fullPath: await createStoredFile('user/image.png', imagesPath, oldTime),
      },
      {
        record: makeFileRecord({ _id: 'archived', file_id: 'archived-file' }),
        fullPath: await createStoredFile('user/archived.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({
          _id: 'agent',
          file_id: 'agent-file',
          context: FileContext.agents,
        }),
        fullPath: await createStoredFile('user/agent.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({ _id: 'orphan', file_id: 'orphan-file' }),
        fullPath: await createStoredFile('user/orphan.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({
          _id: 'code-env',
          file_id: 'code-env-file',
          metadata: { codeEnvRef: { file_id: 'code-env-file' } },
        }),
        fullPath: await createStoredFile('user/code-env.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({ _id: 'remote', file_id: 'remote-file', source: FileSources.s3 }),
        fullPath: await createStoredFile('user/remote.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({
          _id: 'unknown-source',
          file_id: 'unknown-source-file',
          source: undefined,
        }),
        fullPath: await createStoredFile('user/unknown-source.txt', uploadsPath, oldTime),
      },
      {
        record: makeFileRecord({
          _id: 'recent',
          file_id: 'recent-file',
          filepath: '/uploads/user/recent.txt',
        }),
        fullPath: await createStoredFile('user/recent.txt', uploadsPath, recentTime),
      },
      {
        record: makeFileRecord({ _id: 'missing', file_id: 'missing-file' }),
      },
    ];

    const deleteFileRecord = jest.fn(async (recordId) => {
      const file = storedFiles.find(({ record }) => record._id === recordId);
      if (file?.fullPath) {
        const stillExists = await fs.access(file.fullPath).then(
          () => true,
          () => false,
        );
        if (stillExists) {
          throw new Error(`File for record ${recordId} still exists before metadata deletion`);
        }
      }
      return { deletedCount: 1 };
    });

    const result = await deleteEligibleLocalFiles(
      storedFiles.map(({ record }) => record),
      {
        uploadsPath,
        imagesPath,
        cutoffDate,
        fileIdsToDelete: [
          'local-file',
          'image-file',
          'archived-file',
          'agent-file',
          'remote-file',
          'code-env-file',
          'unknown-source-file',
          'recent-file',
          'missing-file',
        ],
        protectedFileIds: ['archived-file', 'agent-file'],
        deleteFileRecord,
      },
    );

    expect(result.deletedFileRecordIds).toEqual(['local', 'image']);
    expect(result.count).toBe(2);
    expect(result.missingFileCount).toBe(1);
    expect(result.recordsDeletedCount).toBe(3);
    expect(result.skippedCount).toBe(7);
    expect(deleteFileRecord.mock.calls).toEqual([['local'], ['image'], ['missing']]);

    for (const { record, fullPath } of storedFiles) {
      if (!fullPath) {
        continue;
      }
      const stillExists = await fs.access(fullPath).then(
        () => true,
        () => false,
      );
      expect(stillExists).toBe(!['local-file', 'image-file'].includes(record.file_id));
    }
  });

  it('leaves symlinks and files outside the allowed roots untouched', async () => {
    const outsidePath = path.join(tempRoot, 'outside.txt');
    const symlinkPath = path.join(uploadsPath, 'user', 'linked.txt');
    await fs.writeFile(outsidePath, 'outside bytes');
    await fs.utimes(
      outsidePath,
      new Date(cutoffDate.getTime() - dayInMs),
      new Date(cutoffDate.getTime() - dayInMs),
    );
    await fs.mkdir(path.dirname(symlinkPath), { recursive: true });
    await fs.symlink(outsidePath, symlinkPath);

    const result = await deleteEligibleLocalFiles(
      [
        makeFileRecord({
          _id: 'symlink',
          file_id: 'symlink-file',
          filepath: '/uploads/user/linked.txt',
        }),
        makeFileRecord({
          _id: 'traversal',
          file_id: 'traversal-file',
          filepath: '/uploads/../outside.txt',
        }),
      ],
      {
        uploadsPath,
        imagesPath,
        cutoffDate,
        fileIdsToDelete: ['symlink-file', 'traversal-file'],
        protectedFileIds: [],
        deleteFileRecord: jest.fn(),
      },
    );

    expect(result.count).toBe(0);
    await expect(fs.readFile(outsidePath, 'utf8')).resolves.toBe('outside bytes');
    await expect(fs.lstat(symlinkPath).then((stats) => stats.isSymbolicLink())).resolves.toBe(true);
  });

  it('collects only file IDs present on message attachments', () => {
    expect([
      ...getMessageFileIds([
        { files: [{ file_id: 'file-1' }, { file_id: 'file-2' }, null] },
        { files: [{ file_id: 'file-1' }, { id: 'ignored' }] },
        { files: null },
      ]),
    ]).toEqual(['file-1', 'file-2']);
  });

  it('collects file IDs from every tool resource', () => {
    expect([
      ...getToolResourceFileIds({
        context: { file_ids: ['context-file'] },
        file_search: { file_ids: ['search-file'] },
        execute_code: { file_ids: ['code-file'] },
        custom_tool: { file_ids: ['custom-file'] },
      }),
    ]).toEqual(['context-file', 'search-file', 'code-file', 'custom-file']);
  });

  it('builds a single file query using updatedAt and protected file IDs', () => {
    expect(buildFileCleanupQuery(cutoffDate, ['agent-file', 'assistant-file'])).toEqual({
      updatedAt: { $lt: cutoffDate },
      context: FileContext.message_attachment,
      source: { $in: [FileSources.local, FileSources.text] },
      'metadata.codeEnvRef': { $exists: false },
      'metadata.codeEnvRefs': { $exists: false },
      'metadata.runFile': { $exists: false },
      file_id: { $nin: ['agent-file', 'assistant-file'] },
    });
  });
});
