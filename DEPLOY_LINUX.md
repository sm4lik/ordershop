# OrderShop - Деплой на Linux сервер

Полное руководство по развёртыванию проекта на Linux сервере (Ubuntu/Debian/CentOS).

## 📋 Содержание

- [Требования](#-требования)
- [Быстрый деплой](#-быстрый-деплой-ubuntu-2004)
- [Пошаговая установка](#-пошаговая-установка)
- [Настройка Nginx](#-настройка-nginx)
- [Настройка SSL](#-настройка-ssl-https)
- [Systemd сервисы](#-systemd-сервисы)
- [База данных](#-база-данных)
- [Мониторинг](#-мониторинг)
- [Бэкапы](#-бэкапы)
- [Обновление](#-обновление)
- [Безопасность](#-безопасность)
- [Troubleshooting](#-troubleshooting)

## 🛠 Требования

### Минимальные
- **CPU:** 2 ядра
- **RAM:** 2 GB
- **Disk:** 20 GB
- **OS:** Ubuntu 20.04+ / Debian 10+ / CentOS 8+

### Рекомендуемые
- **CPU:** 4 ядра
- **RAM:** 4 GB
- **Disk:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS

## 🚀 Быстрый деплой (Ubuntu 20.04+)

```bash
# 1. Обновление системы
sudo apt update && sudo apt upgrade -y

# 2. Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Установка MySQL
sudo apt install -y mysql-server

# 4. Установка Nginx
sudo apt install -y nginx

# 5. Клонирование репозитория
cd /var/www
sudo git clone https://github.com/sm4lik/ordershop.git
sudo chown -R $USER:$USER ordershop
cd ordershop

# 6. Установка зависимостей
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 7. Настройка .env
cd backend
cp .env.example .env
nano .env  # Отредактируйте настройки

# 8. База данных
sudo mysql -u root -p -e "CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -u root -p ordershop < database/schema_full.sql
sudo mysql -u root -p ordershop < database/seed.sql

# 9. Сборка frontend
cd ../frontend
npm run build
cd ..

# 10. Настройка Nginx
sudo nano /etc/nginx/sites-available/ordershop
# (см. конфигурацию ниже)

sudo ln -s /etc/nginx/sites-available/ordershop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 11. Systemd сервисы
sudo nano /etc/systemd/system/ordershop-backend.service
# (см. конфигурацию ниже)

sudo systemctl daemon-reload
sudo systemctl enable ordershop-backend
sudo systemctl start ordershop-backend

# 12. SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Готово!
```

## 📝 Пошаговая установка

### Шаг 1: Подготовка сервера

```bash
# Обновление пакетов
sudo apt update
sudo apt upgrade -y

# Установка необходимых утилит
sudo apt install -y curl git wget build-essential

# Настройка фаервола
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Шаг 2: Установка Node.js

```bash
# Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node -v  # v18.x.x
npm -v   # 9.x.x
```

### Шаг 3: Установка MySQL

```bash
sudo apt install -y mysql-server

# Безопасная установка
sudo mysql_secure_installation

# Ответы:
# - Validate Password Plugin: No (или Yes для production)
# - Change root password: No
# - Remove anonymous users: Yes
# - Disallow root login remotely: Yes
# - Remove test database: Yes
# - Reload privilege tables: Yes
```

### Шаг 4: Создание базы данных

```bash
sudo mysql -u root -p

# В MySQL консоли:
CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'ordershop'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON ordershop.* TO 'ordershop'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Импортируйте схему
cd /var/www/ordershop/backend
mysql -u ordershop -p ordershop < database/schema_full.sql
mysql -u ordershop -p ordershop < database/seed.sql
```

### Шаг 5: Установка приложения

```bash
# Переход в директорию
cd /var/www

# Клонирование (или загрузка через SFTP)
sudo git clone https://github.com/sm4lik/ordershop.git
sudo chown -R www-data:www-data ordershop
cd ordershop

# Установка зависимостей
npm install --production

# Backend
cd backend
npm install --production
cp .env.example .env
nano .env

# Frontend
cd ../frontend
npm install
npm run build
cd ..
```

### Шаг 6: Настройка .env

```bash
cd /var/www/ordershop/backend
nano .env
```

**backend/.env:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=ordershop
DB_PASSWORD=secure_password_here
DB_NAME=ordershop
JWT_SECRET=very_long_random_string_here_use_openssl_rand_base64_32
JWT_EXPIRES_IN=7d
NODE_ENV=production

# ЮMoney (опционально)
YOOMONEY_CLIENT_ID=your_client_id
YOOMONEY_CLIENT_SECRET=your_client_secret
YOOMONEY_ACCOUNT=41001XXXXXXXXXXXX
YOOMONEY_REDIRECT_URI=https://yourdomain.com/payment/callback
YOOMONEY_WEBHOOK_URL=https://yourdomain.com/api/payment/webhook
```

**frontend/.env:**
```env
VITE_API_URL=https://yourdomain.com/api
```

### Шаг 7: Сборка frontend

```bash
cd /var/www/ordershop/frontend
npm run build

# Проверка
ls -la dist/
```

## 🌐 Настройка Nginx

### Конфигурация сайта

```bash
sudo nano /etc/nginx/sites-available/ordershop
```

**/etc/nginx/sites-available/ordershop:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS (после настройки SSL)
    # return 301 https://$server_name$request_uri;
    
    # Frontend статика
    location / {
        root /var/www/ordershop/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
    
    # Webhook для ЮMoney (без CSRF)
    location /api/payment/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Content-Type $content_type;
        proxy_set_header Content-Length $content_length;
    }
    
    # Запрет доступа к скрытым файлам
    location ~ /\. {
        deny all;
    }
}
```

### Активация сайта

```bash
# Создание симлинка
sudo ln -s /etc/nginx/sites-available/ordershop /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Настройка SSL (HTTPS)

### Let's Encrypt (бесплатно)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Проверка автообновления
sudo certbot renew --dry-run
```

### Обновление конфигурации Nginx

После настройки SSL, обновите `/etc/nginx/sites-available/ordershop`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # ... остальная конфигурация (см. выше)
}
```

## 🔧 Systemd сервисы

### Backend сервис

```bash
sudo nano /etc/systemd/system/ordershop-backend.service
```

**/etc/systemd/system/ordershop-backend.service:**
```ini
[Unit]
Description=OrderShop Backend API
Documentation=https://github.com/sm4lik/ordershop
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/ordershop/backend
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ordershop-backend

# Переменные окружения
Environment=NODE_ENV=production
Environment=PORT=3000

# Лимиты
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

### Управление сервисом

```bash
# Перезагрузка systemd
sudo systemctl daemon-reload

# Включение автозапуска
sudo systemctl enable ordershop-backend

# Запуск
sudo systemctl start ordershop-backend

# Проверка статуса
sudo systemctl status ordershop-backend

# Просмотр логов
sudo journalctl -u ordershop-backend -f

# Перезапуск
sudo systemctl restart ordershop-backend

# Остановка
sudo systemctl stop ordershop-backend
```

## 🗄 База данных

### Оптимизация MySQL

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Добавить/изменить:**
```ini
[mysqld]
# Производительность
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Соединения
max_connections = 200
thread_cache_size = 50

# Кэширование
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# Логирование медленных запросов
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

```bash
sudo systemctl restart mysql
```

### Автоматические бэкапы

```bash
sudo nano /usr/local/bin/backup-ordershop.sh
```

**/usr/local/bin/backup-ordershop.sh:**
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ordershop"
DB_USER="ordershop"
DB_PASS="secure_password_here"
DB_NAME="ordershop"

# Создание директории
mkdir -p $BACKUP_DIR

# Бэкап базы данных
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Бэкап файлов (опционально)
# tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ordershop

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Права доступа
sudo chmod +x /usr/local/bin/backup-ordershop.sh

# Cron (ежедневно в 3:00)
sudo crontab -e
# Добавить: 0 3 * * * /usr/local/bin/backup-ordershop.sh >> /var/log/ordershop_backup.log 2>&1
```

## 📊 Мониторинг

### Логи

```bash
# Backend логи
sudo journalctl -u ordershop-backend -f

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# MySQL slow log
sudo tail -f /var/log/mysql/slow.log
```

### Мониторинг ресурсов

```bash
# Установка htop
sudo apt install -y htop

# Проверка использования памяти
free -h

# Проверка диска
df -h

# Проверка CPU
top
```

### Uptime мониторинг

```bash
# Установка PM2 (опционально)
sudo npm install -g pm2

# Запуск через PM2
cd /var/www/ordershop/backend
pm2 start dist/index.js --name ordershop-api

# Сохранение конфигурации
pm2 save
pm2 startup
```

## 🔄 Обновление

```bash
cd /var/www/ordershop

# Остановка сервиса
sudo systemctl stop ordershop-backend

# Pull изменений
sudo git pull

# Установка зависимостей
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Сборка frontend
cd frontend
npm run build
cd ..

# Перезапуск
sudo systemctl start ordershop-backend

# Проверка
sudo systemctl status ordershop-backend
```

## 🔐 Безопасность

### 1. Настройка фаервола

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306/tcp  # Только если нужен удалённый MySQL
sudo ufw enable
sudo ufw status
```

### 2. Отключение root login

```bash
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

sudo systemctl restart sshd
```

### 3. Обновление безопасности

```bash
# Автоматические обновления
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Настройка
sudo nano /etc/fail2ban/jail.local
```

**/etc/fail2ban/jail.local:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true

[sshd]
enabled = true
```

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверка логов
sudo journalctl -u ordershop-backend -n 50

# Проверка порта
sudo lsof -i :3000

# Проверка прав
sudo chown -R www-data:www-data /var/www/ordershop
```

### Nginx не работает

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/error.log
```

### MySQL не подключается

```bash
# Проверка статуса
sudo systemctl status mysql

# Проверка пользователя
mysql -u ordershop -p -e "SELECT User, Host FROM mysql.user;"

# Проверка прав
mysql -u root -p -e "SHOW GRANTS FOR 'ordershop'@'localhost';"
```

### Ошибки CORS

Проверьте конфигурацию Nginx и backend CORS настройки.

### 502 Bad Gateway

```bash
# Проверка backend
sudo systemctl status ordershop-backend

# Проверка логов
sudo tail -f /var/log/nginx/error.log
```

## 📞 Поддержка

- Документация: `README.md`, `INSTALL.md`
- GitHub Issues: https://github.com/sm4lik/ordershop/issues
- Email: ftptrump@gmail.com

---

**Version:** 1.0.0  
**Last Updated:** 2024-02-24
