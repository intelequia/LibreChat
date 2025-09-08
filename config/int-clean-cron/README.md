# Intelequia Chat Cleanup Cron Task

Automated chat cleanup system for LibreChat with integrated logging.

## Simple Operation ✨

1. **Cron script**: `cron-clean-chats.js` - Executes cleanup command
2. **Integrated logging**: `config/clean-chats.js` automatically generates logs
3. **Automatic statistics**: Captures specific Intelequia metrics

## Files

- `cron-clean-chats.js` - Simplified cron script
- `setup-cron.sh` - Cron setup script
- `test-logs.sh` - Log testing script
- `logs/intelewriter-cleanup.log` - **Main log with Intelequia statistics**
- `README.md` - This file

## Cron Setup

To configure the cron task:

```bash
chmod +x setup-cron.sh
./setup-cron.sh
```

This sets up a daily task running at 02:00 AM.

## 📊 Log Statistics

The `logs/intelewriter-cleanup.log` file contains **exactly** the statistics you need:

### ✅ When NO data to delete:
```
[2025-09-08T09:12:35.101Z] ========================================
[2025-09-08T09:12:35.103Z] Intelequia cleanup job completed - no data to delete
[2025-09-08T09:12:35.103Z] STATS: Chats deleted: 0 | Messages deleted: 0 | Files deleted: 0
[2025-09-08T09:12:35.104Z] CONFIG: Cleanup interval: 30 days
[2025-09-08T09:12:35.104Z] DETAILS: Cutoff date: 2025-08-09 | Protected files: 2
[2025-09-08T09:12:35.104Z] ========================================
```

### ✅ When data IS deleted:
```
[YYYY-MM-DDTHH:mm:ss.sssZ] ========================================
[YYYY-MM-DDTHH:mm:ss.sssZ] Intelequia cleanup job completed successfully
[YYYY-MM-DDTHH:mm:ss.sssZ] STATS: Chats deleted: 15 | Messages deleted: 120 | Files deleted: 8
[YYYY-MM-DDTHH:mm:ss.sssZ] CONFIG: Cleanup interval: 30 days
[YYYY-MM-DDTHH:mm:ss.sssZ] DETAILS: Cutoff date: YYYY-MM-DD | Space freed: 2.5 MB | Protected files: 45
[YYYY-MM-DDTHH:mm:ss.sssZ] ========================================
```

### ❌ On error:
```
[YYYY-MM-DDTHH:mm:ss.sssZ] ========================================
[YYYY-MM-DDTHH:mm:ss.sssZ] Intelequia cleanup job FAILED
[YYYY-MM-DDTHH:mm:ss.sssZ] ERROR: [error description]
[YYYY-MM-DDTHH:mm:ss.sssZ] CONFIG: Cleanup interval: 30 days
[YYYY-MM-DDTHH:mm:ss.sssZ] DETAILS: Attempted cutoff date: YYYY-MM-DD
[YYYY-MM-DDTHH:mm:ss.sssZ] ========================================
```

## 🎯 Captured Information

Each execution logs:

- **Chats deleted**: Number of conversations deleted
- **Messages deleted**: Number of messages deleted
- **Files deleted**: Number of physical files deleted
- **Cleanup interval**: Days configured in `.env`
- **Cutoff date**: Date limit for deletion
- **Space freed**: Disk space recovered
- **Protected files**: Agent/assistant files that are preserved

## 🔧 Manual Execution

To test manually:

```bash
# From host (recommended):
cd /home/azureuser/LibreChat
node config/clean-chats.js -y

# From container:
docker exec -it [container_name] node config/clean-chats.js -y
```

## 📋 Log Verification

```bash
# View recent logs
tail -f /home/azureuser/LibreChat/config/int-clean-cron/logs/intelewriter-cleanup.log

# View only statistics
grep "STATS" /home/azureuser/LibreChat/config/int-clean-cron/logs/intelewriter-cleanup.log

# View only successful results
grep "completed successfully" /home/azureuser/LibreChat/config/int-clean-cron/logs/intelewriter-cleanup.log
```

## ⚙️ Configuration

System reads configuration from `CLEAN_DATA_INTERVAL` in `.env` file:

```bash
# Example in .env:
CLEAN_DATA_INTERVAL=30   # Clean data older than 30 days
```

## 🛡️ Security Features

- **Total protection**: Agent and assistant files are never deleted
- **Minimum period**: 30-day minimum retention
- **User data only**: Deletes only user message attachments
- **Complete logging**: Detailed record of all activity
- **Daily history**: Records every execution, even with no data to delete

---
*Simplified cleanup system with integrated logging - Intelequia*
