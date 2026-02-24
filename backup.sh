#!/bin/bash

# OrderShop Backup Script
# Автоматический бэкап базы данных и файлов

set -e

# Конфигурация
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ordershop"
DEPLOY_DIR="/var/www/ordershop"
DB_USER="ordershop"
DB_PASS="YOUR_DB_PASSWORD"
DB_NAME="ordershop"
RETENTION_DAYS=7

# Создание директории
mkdir -p $BACKUP_DIR

echo "=== OrderShop Backup ==="
echo "Date: $DATE"
echo ""

# 1. Бэкап базы данных
echo "[1/3] Бэкап базы данных..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz
echo "✓ Database backup: db_$DATE.sql.gz"

# 2. Бэкап .env файлов
echo "[2/3] Бэкап конфигурации..."
tar -czf $BACKUP_DIR/env_$DATE.tar.gz \
  $DEPLOY_DIR/backend/.env \
  $DEPLOY_DIR/frontend/.env 2>/dev/null || true
echo "✓ Config backup: env_$DATE.tar.gz"

# 3. Бэкап загруженных файлов (если есть)
echo "[3/3] Бэкап загруженных файлов..."
if [ -d "$DEPLOY_DIR/backend/uploads" ]; then
  tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $DEPLOY_DIR/backend/uploads
  echo "✓ Uploads backup: uploads_$DATE.tar.gz"
fi

# 4. Удаление старых бэкапов
echo ""
echo "Удаление старых бэкапов (старше $RETENTION_DAYS дней)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 5. Информация о размере
echo ""
echo "Размер бэкапов:"
du -sh $BACKUP_DIR/*

# 6. Проверка целостности
echo ""
echo "Проверка целостности..."
if gzip -t $BACKUP_DIR/db_$DATE.sql.gz 2>/dev/null; then
  echo "✓ Database backup OK"
else
  echo "✗ Database backup CORRUPTED"
  exit 1
fi

echo ""
echo "=== Backup completed successfully ==="
echo "Location: $BACKUP_DIR"

# Опционально: загрузка в облако (раскомментировать при необходимости)
# aws s3 cp $BACKUP_DIR s3://your-bucket/ordershop/backups/
# rclone copy $BACKUP_DIR remote:backup/ordershop
