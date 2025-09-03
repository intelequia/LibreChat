# Intelequia - Intelewriter Automatic Cleanup (Internal Mode)

This folder contains the Intelequia scripts for automatic cleanup of Intelewriter chats.

## 📁 Files

- `cron-clean-chats.js` - Internal cron script (runs INSIDE the container)
- `setup-cron.sh` - Automatic cron job configurator (Internal mode)
- `README.md` - This documentation

## 🚀 Quick Setup (Internal Mode)

### Prerequisites

1. **LibreChat running with Docker Compose**
2. **Configure CLEAN_DATA_INTERVAL in .env:**
   ```bash
   # Example: clean data older than 90 days
   CLEAN_DATA_INTERVAL=90
   ```

### Installation: Internal Cron (Automatic)

This is the **NEW IMPROVED** approach: the cron runs INSIDE the LibreChat container and configures itself automatically when the container starts.

#### How it works:

1. **Automatic Setup**: When the container starts, it automatically installs cron and configures the cleanup job
2. **Internal Execution**: The cron runs inside the container, no external dependencies
3. **Persistent**: Survives container recreations and updates

#### No Manual Setup Required!

The system is now **completely automatic**. Just start your LibreChat container and the cron will be configured and running.

## 🐳 How Internal Mode Works

### Architecture:
1. **Container starts** with docker-compose
2. **Automatically installs cron** and dependencies  
3. **Configures internal cron job** (daily at 6:00 AM)
4. **Starts LibreChat backend** as usual
5. **Cron runs automatically** inside the container

### Command Flow:
```
Container startup → Install cron → Configure cron → Start backend → Internal cron executes cleanup
```

## ⚙️ Enhanced Internal Features

### Automatic Setup:
- ✅ **Zero manual configuration** required
- ✅ **Automatic cron installation** when container starts
- ✅ **Self-configuring** cleanup schedule
- ✅ **Immediate activation** on container creation

### Smart Internal Execution:
- ✅ Runs directly inside the container (no external dependencies)
- ✅ Direct access to npm commands and environment
- ✅ Integrated logging within container logs
- ✅ No Docker socket access needed

## 🔍 Verification and Testing

### Checking Internal Cron Status:

```bash
# Check if container is running
docker-compose ps

# Access container shell
docker-compose exec api bash

# Inside container - check cron status
crontab -l

# Inside container - check logs
tail -f /app/config/int-clean-cron/logs/intelewriter-cleanup.log

# Inside container - test script manually
node /app/config/int-clean-cron/cron-clean-chats.js
```

### Manual Cleanup Commands:

```bash
# From outside container
docker-compose exec api npm run clean-chats -- -y

# From inside container
npm run clean-chats -- -y
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

## 🔄 Internal Workflow

### Automatic Cron Execution:
1. **Container starts** with docker-compose up
2. **Setup script runs** automatically during startup
3. **Cron is installed** and configured internally
4. **Internal cron** triggers at 6 AM daily
5. `cron-clean-chats.js` runs **INSIDE container**
6. Script executes `npm run clean-chats -- -y` directly
7. `clean-chats.js` runs and reads `CLEAN_DATA_INTERVAL` from `.env`
8. **Only deletes user files** (protects agents/assistants)
9. Logs results to internal log file

### Container Recreation Safety:
- ✅ **Container recreated?** → Cron auto-configures on startup
- ✅ **Image updated?** → Cron auto-configures on startup  
- ✅ **Service restarted?** → Cron auto-configures on startup
- ✅ **Host rebooted?** → Cron auto-configures when containers start

## 🛠️ Maintenance

### Viewing Status:
```bash
# Check container cron status
docker-compose exec api crontab -l

# Check container status
docker-compose ps

# View recent logs (from inside container)
docker-compose exec api tail -20 /app/config/int-clean-cron/logs/intelewriter-cleanup.log

# Test internal connectivity
docker-compose exec api echo "Container accessible"
```

### Changing Schedule:
1. Modify `setup-cron.sh` (change the `CRON_SCHEDULE` variable)
2. Restart the container: `docker-compose restart api`
3. The new schedule will be automatically configured

### Troubleshooting:

#### Common Issues:

1. **Container not starting:**
   ```bash
   # Check container logs
   docker-compose logs api
   ```

2. **Cron not running:**
   ```bash
   # Check if cron service is running inside container
   docker-compose exec api service cron status
   
   # Restart cron service
   docker-compose exec api service cron restart
   ```

3. **Script execution errors:**
   ```bash
   # Test script manually
   docker-compose exec api node /app/config/int-clean-cron/cron-clean-chats.js
   ```

4. **Permission issues:**
   - The container now runs as root to install and manage cron
   - This is necessary for the internal cron functionality

#### Log Locations:
- **Main logs:** `/app/config/int-clean-cron/logs/intelewriter-cleanup.log` (inside container)
- **Container logs:** `docker-compose logs api`
- **System cron logs:** Inside container at `/var/log/cron`

---
*Developed by Intelequia for Intelewriter - Internal Mode*
