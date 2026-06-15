#!/bin/bash

echo "📦 ShikkhaERP Backup Script"
echo "============================"

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
echo "Backing up database..."
export PGPASSWORD='Farhana251@'
pg_dump -U postgres -h localhost shikkhaerp > $BACKUP_DIR/database.sql

# Backup application logs
echo "Backing up logs..."
cp -r logs/ $BACKUP_DIR/logs/ 2>/dev/null || true

# Create backup archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR/

echo "✅ Backup completed: $BACKUP_DIR.tar.gz"