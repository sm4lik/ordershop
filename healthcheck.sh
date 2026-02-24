#!/bin/bash

# OrderShop Health Check Script
# Проверка состояния сервисов и отправка уведомлений

set -e

# Конфигурация
BACKEND_URL="http://localhost:3000/api/settings"
LOG_FILE="/var/log/ordershop-health.log"
ALERT_EMAIL="admin@yourdomain.com"

# Функция отправки уведомлений
send_alert() {
  local message="$1"
  echo "$(date): $message" >> $LOG_FILE
  
  # Email уведомление (если настроено)
  # echo "$message" | mail -s "OrderShop Alert" $ALERT_EMAIL
  
  # Telegram уведомление (опционально)
  # curl -s -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" \
  #   -d chat_id=YOUR_CHAT_ID -d text="$message"
}

echo "=== OrderShop Health Check ==="
echo "Time: $(date)"
echo ""

# 1. Проверка Backend сервиса
echo "[1/5] Проверка Backend сервиса..."
if systemctl is-active --quiet ordershop-backend; then
  echo "✓ Backend service is running"
else
  echo "✗ Backend service is NOT running"
  send_alert "🔴 Backend service is down!"
  systemctl start ordershop-backend
fi

# 2. Проверка Nginx
echo "[2/5] Проверка Nginx..."
if systemctl is-active --quiet nginx; then
  echo "✓ Nginx is running"
else
  echo "✗ Nginx is NOT running"
  send_alert "🔴 Nginx is down!"
  systemctl restart nginx
fi

# 3. Проверка MySQL
echo "[3/5] Проверка MySQL..."
if systemctl is-active --quiet mysql; then
  echo "✓ MySQL is running"
else
  echo "✗ MySQL is NOT running"
  send_alert "🔴 MySQL is down!"
  systemctl restart mysql
fi

# 4. Проверка доступности API
echo "[4/5] Проверка API..."
if curl -f -s -o /dev/null $BACKEND_URL; then
  echo "✓ API is accessible"
else
  echo "✗ API is NOT accessible"
  send_alert "🔴 API is not responding!"
fi

# 5. Проверка дискового пространства
echo "[5/5] Проверка дискового пространства..."
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
  echo "✗ Disk usage is high: ${DISK_USAGE}%"
  send_alert "⚠️ Disk usage is high: ${DISK_USAGE}%"
else
  echo "✓ Disk usage: ${DISK_USAGE}%"
fi

# 6. Проверка памяти
echo ""
echo "Использование памяти:"
free -h | grep Mem

# 7. Проверка логов на ошибки
echo ""
echo "Последние ошибки в логах Backend:"
journalctl -u ordershop-backend --since "1 hour ago" -p err | tail -5 || echo "Нет ошибок"

echo ""
echo "=== Health Check Complete ==="
