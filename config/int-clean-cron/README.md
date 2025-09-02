# Intelequia - Intelewriter Automatic Cleanup (Docker Mode)

This folder contains the Intelequia scripts for automatic cleanup of Intelewriter chats.

## 📁 Files

- `cron-clean-chats.js` - Docker-aware cron script (runs on HOST, executes in CONTAINER)
- `setup-cron.sh` - Automatic cron job configurator (Docker mode)
- `test-docker-cleanup.sh` - Test script to verify Docker setup
- `README.md` - This documentation

## 🚀 Quick Setup (Docker Mode)

### Prerequisites

1. **LibreChat running with Docker Compose**
2. **Configure CLEAN_DATA_INTERVAL in .env:**
   ```bash
   # Example: clean data older than 90 days
   CLEAN_DATA_INTERVAL=90
   ```

### Installation: Host Cron → Container Execution (Recommended)

This is the **SAFEST** approach: the cron runs on the host but executes commands inside the LibreChat container.

#### Step 1: Test the Setup First

```bash
# Navigate to the script directory
cd /path/to/your/LibreChat/config/int-clean-cron

# Make the test script executable
chmod +x test-docker-cleanup.sh

# Test that Docker cleanup works
./test-docker-cleanup.sh
```

#### Step 2: Configure Automatic Cron

```bash
# Make the setup script executable
chmod +x setup-cron.sh

# Run the setup script (this sets up cron on the HOST)
./setup-cron.sh
```

### Alternative Approaches

#### Option 1: Manual Docker Command
```bash
# Run cleanup directly in container
docker-compose exec api npm run clean-chats -- -y

# Or if your service is named differently:
docker-compose exec librechat npm run clean-chats -- -y
```

#### Option 2: Manual Host Cron Setup
```bash
# Add to host crontab manually
crontab -e

# Add this line (adjust paths as needed):
0 6 * * * /usr/bin/node /path/to/LibreChat/config/int-clean-cron/cron-clean-chats.js >> /path/to/LibreChat/config/int-clean-cron/logs/intelewriter-cleanup.log 2>&1
```

## 🐳 How Docker Mode Works

### Architecture:
1. **Cron runs on HOST** (physical machine/VM)
2. **Commands execute INSIDE LibreChat container**
3. **Survives container recreations** ✅
4. **Survives image updates** ✅
5. **Survives service restarts** ✅

### Command Flow:
```
HOST cron → docker-compose exec → LibreChat container → npm run clean-chats
```

## ⚙️ Enhanced Docker Features

### Automatic Service Discovery:
The `cron-clean-chats.js` script will:
1. Log which service worked for future reference
2. Fail gracefully if no service is found

### Enhanced Error Handling:
- ✅ Detects if containers are not running
- ✅ Tries multiple service names
- ✅ Clear error messages
- ✅ Detailed logging

### Smart Logging:
- 📝 Container execution details
- � Service discovery process
- �️ Protection status (agents/assistants files)
- 📈 Cleanup results

## 🔍 Verification and Testing

### Testing Commands:

```bash
# Test the Docker cleanup manually
./test-docker-cleanup.sh

# Test the cron script directly
node cron-clean-chats.js

# Check what containers are running
docker-compose ps

# View current host crontab
crontab -l

# View logs in real-time
tail -f logs/intelewriter-cleanup.log
```

### Manual Cleanup Commands:

```bash
docker-compose exec librechat npm run clean-chats -- -y

# With custom days
docker-compose exec api npm run clean-chats 120 -y
```

## 📋 CLEAN_DATA_INTERVAL Examples

```bash
# ✅ Valid values in .env:
CLEAN_DATA_INTERVAL=30     # Minimum allowed
CLEAN_DATA_INTERVAL=90     # 3 months (recommended)
CLEAN_DATA_INTERVAL="180"  # 6 months (with quotes)

# ❌ Values that will NOT execute cleanup:
CLEAN_DATA_INTERVAL=       # Empty
CLEAN_DATA_INTERVAL=abc    # Non-numeric
CLEAN_DATA_INTERVAL=15     # Less than 30 days
# CLEAN_DATA_INTERVAL=90   # Commented out
```

## 🔄 Docker Workflow

### Automatic Cron Execution:
1. **Host cron** triggers at 6 AM daily
2. `cron-clean-chats.js` runs on **HOST**
3. Script executes `docker-compose exec [service] npm run clean-chats -- -y`
4. `clean-chats.js` runs **INSIDE container**
5. Reads `CLEAN_DATA_INTERVAL` from container's `.env`
6. **Only deletes user files** (protects agents/assistants)
7. Logs results back to host

### Container Recreation Safety:
- ✅ **Container recreated?** → Cron still works
- ✅ **Image updated?** → Cron still works  
- ✅ **Service restarted?** → Cron still works
- ✅ **Host rebooted?** → Cron restored automatically

## 🛠️ Maintenance

### Viewing Status:
```bash
# Check host cron status
crontab -l | grep intelewriter

# Check container status
docker-compose ps

# View recent logs
tail -20 logs/intelewriter-cleanup.log

# Test connectivity to container
docker-compose exec api echo "Container accessible"
```

### Removing Cron Job:
```bash
# Edit host crontab and remove Intelequia lines
crontab -e
```

### Changing Schedule:
1. Modify `setup-cron.sh` (change the `CRON_SCHEDULE` variable)
2. Run `./setup-cron.sh` again
3. Confirm replacement when prompted

### Troubleshooting:

#### Common Issues:

1. **"No such service" error:**
   ```bash
   # Check available services
   docker-compose ps --services
   # Update script if needed
   ```

2. **Container not running:**
   ```bash
   # Start LibreChat
   docker-compose up -d
   ```

3. **Permission denied:**
   ```bash
   # Ensure scripts are executable
   chmod +x *.sh
   ```

4. **Node.js not found in container:**
   - This shouldn't happen with official LibreChat images
   - Check if you're using a custom image

#### Log Locations:
- **Main logs:** `./logs/intelewriter-cleanup.log`
- **Host cron logs:** `/var/log/cron` or `journalctl -u cron`
- **Container logs:** `docker-compose logs api`

## 🛡️ Safety Features

### File Protection:
- ❌ **NEVER deletes:** Agent files (any age)
- ❌ **NEVER deletes:** Assistant files (any age)
- ❌ **NEVER deletes:** System files
- ✅ **Only deletes:** User message attachments older than X days

### Execution Safety:
- 🔒 **Minimum 30 days** retention
- 🔍 **Validates .env** before execution
- 🛡️ **Protects files in use** by agents/assistants
- 📝 **Detailed logging** of what's protected vs. deleted

---
*Developed by Intelequia for Intelewriter - Docker Mode*
