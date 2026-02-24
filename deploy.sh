#!/bin/bash

# OrderShop Linux Deploy Script
# Автоматическая установка OrderShop на Ubuntu/Debian сервер

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка root прав
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Пожалуйста, запустите от root${NC}"
  exit 1
fi

echo -e "${GREEN}=== OrderShop Deployment Script ===${NC}"
echo ""

# Конфигурация
DEPLOY_DIR="/var/www/ordershop"
DB_NAME="ordershop"
DB_USER="ordershop"
DB_PASS=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=""

# Ввод домена
read -p "Введите домен (например, example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Домен не введён${NC}"
  exit 1
fi

echo -e "${YELLOW}Начинаем установку...${NC}"

# 1. Обновление системы
echo -e "${GREEN}[1/12] Обновление системы...${NC}"
apt update && apt upgrade -y

# 2. Установка зависимостей
echo -e "${GREEN}[2/12] Установка зависимостей...${NC}"
apt install -y curl git wget build-essential mysql-server nginx ufw

# 3. Установка Node.js
echo -e "${GREEN}[3/12] Установка Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 4. Настройка MySQL
echo -e "${GREEN}[4/12] Настройка MySQL...${NC}"
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

# 5. Клонирование репозитория
echo -e "${GREEN}[5/12] Клонирование репозитория...${NC}"
mkdir -p $DEPLOY_DIR
git clone https://github.com/YOUR_USERNAME/ordershop.git $DEPLOY_DIR
chown -R www-data:www-data $DEPLOY_DIR

# 6. Установка зависимостей
echo -e "${GREEN}[6/12] Установка зависимостей...${NC}"
cd $DEPLOY_DIR
npm install

cd backend
npm install --production
cp .env.example .env

# Обновление .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env

cd ../frontend
npm install

# 7. Импорт БД
echo -e "${GREEN}[7/12] Импорт базы данных...${NC}"
cd $DEPLOY_DIR/backend
mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/schema_full.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < database/seed.sql

# 8. Сборка frontend
echo -e "${GREEN}[8/12] Сборка frontend...${NC}"
cd $DEPLOY_DIR/frontend
npm run build

# 9. Настройка Nginx
echo -e "${GREEN}[9/12] Настройка Nginx...${NC}"
cat > /etc/nginx/sites-available/ordershop <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $DEPLOY_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    location ~ /\. {
        deny all;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ordershop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 10. Systemd сервис
echo -e "${GREEN}[10/12] Настройка systemd сервиса...${NC}"
cat > /etc/systemd/system/ordershop-backend.service <<EOF
[Unit]
Description=OrderShop Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$DEPLOY_DIR/backend
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ordershop-backend
Environment=NODE_ENV=production
Environment=PORT=3000
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ordershop-backend
systemctl start ordershop-backend

# 11. Настройка фаервола
echo -e "${GREEN}[11/12] Настройка фаервола...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 12. SSL сертификат
echo -e "${GREEN}[12/12] Настройка SSL...${NC}"
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Сохранение паролей
cat > /root/ordershop_credentials.txt <<EOF
OrderShop Credentials
=====================
Domain: $DOMAIN
Database: $DB_NAME
DB User: $DB_USER
DB Password: $DB_PASS
JWT Secret: $JWT_SECRET
Admin Email: admin@$DOMAIN
=====================
Generated: $(date)
EOF

chmod 600 /root/ordershop_credentials.txt

echo ""
echo -e "${GREEN}=== Установка завершена! ===${NC}"
echo ""
echo -e "${YELLOW}Важная информация:${NC}"
echo "Домен: $DOMAIN"
echo "Backend статус: $(systemctl is-active ordershop-backend)"
echo "Nginx статус: $(systemctl is-active nginx)"
echo ""
echo -e "${RED}Сохраните данные из /root/ordershop_credentials.txt${NC}"
echo ""
echo -e "Сайт доступен по адресу: ${GREEN}https://$DOMAIN${NC}"
echo ""
