# OrderShop - Система управления заказами ресторана

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Полнофункциональная веб-система для управления заказами ресторана с админ-панелью, онлайн-оплатой и бухгалтерским учётом.

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологии](#-технологии)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Настройка](#-настройка)
- [API Документация](#-api-документация)
- [Функционал](#-функционал)
- [Команда](#-команда)
- [Лицензия](#-лицензия)

## ✨ Возможности

### Для клиентов
- 🍔 Просмотр меню с категориями
- 🛒 Корзина заказов
- 📝 Оформление заказа с доставкой
- 💳 Онлайн-оплата через ЮMoney
- 📊 Отслеживание статуса заказа
- 👤 Личный кабинет с историей заказов
- ⭐ Отзывы и рейтинги товаров

### Для администраторов
- 📈 Дашборд со статистикой
- 📦 Управление заказами (CRUD)
- 🍕 Управление меню (товары, категории)
- 👥 Управление пользователями
- ⚙️ Настройки ресторана
- 📊 Бухгалтерский учёт доходов/расходов
- 💰 Выгрузка отчётов в Excel/CSV
- 🔔 Звуковые уведомления о новых заказах

### Для модераторов/барменов
- 👀 Просмотр заказов
- ✏️ Редактирование статусов заказов
- 📝 Управление отзывами

## 🛠 Технологии

### Backend
- **Node.js** + **Express** - сервер
- **TypeScript** - типизация
- **MySQL** - база данных
- **JWT** - аутентификация
- **Bcrypt** - хеширование паролей
- **Axios** - HTTP запросы

### Frontend
- **Vue 3** (Composition API) - фреймворк
- **TypeScript** - типизация
- **Pinia** - состояние
- **Vue Router** - роутинг
- **Axios** - API клиент
- **TailwindCSS** - стили
- **Vite** - сборщик

### Интеграции
- **ЮMoney Wallet API** - онлайн-платежи
- **FontAwesome** - иконки

## 📁 Структура проекта

```
OrderShop/
├── backend/                    # Backend сервер
│   ├── src/
│   │   ├── config/            # Конфигурация (БД, CORS)
│   │   ├── controllers/       # Контроллеры
│   │   │   ├── authController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── productController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── transactionController.ts
│   │   │   └── ...
│   │   ├── middleware/        # Middleware (auth, CORS)
│   │   ├── routes/            # API роуты
│   │   └── index.ts           # Точка входа
│   ├── database/
│   │   ├── schema_full.sql    # Полная схема БД
│   │   ├── add_online_payment.sql
│   │   └── init_accounting.sql
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # Frontend приложение
│   ├── src/
│   │   ├── api/               # API клиент
│   │   ├── components/        # Vue компоненты
│   │   ├── composables/       # Композаблы
│   │   │   ├── useSoundNotification.ts
│   │   │   └── useOrderMonitoring.ts
│   │   ├── router/            # Роутер
│   │   ├── stores/            # Pinia stores
│   │   ├── views/             # Страницы
│   │   │   ├── admin/
│   │   │   │   ├── AdminPanel.vue
│   │   │   │   ├── AccountingView.vue
│   │   │   │   └── ...
│   │   │   ├── PaymentView.vue
│   │   │   └── ...
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   │   └── sounds/            # Звуковые файлы
│   └── package.json
│
├── .gitignore
├── README.md
├── INSTALL.md                  # Подробная инструкция
└── package.json               # Корневой package.json
```

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- MySQL 8+
- npm или yarn

### Локальная разработка

1. **Клонирование репозитория**

```bash
git clone https://github.com/sm4lik/ordershop.git
cd ordershop
```

2. **Установка зависимостей**

```bash
# Установить всё сразу
npm run install:all

# Или по отдельности
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. **Настройка базы данных**

```bash
# Создайте БД
mysql -u root -p -e "CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Импортируйте схему
mysql -u root -p ordershop < backend/database/schema_full.sql

# Импортируйте тестовые данные
mysql -u root -p ordershop < backend/database/seed.sql

# Настройте пароль администратора (пароль: admin123)
mysql -u root -p ordershop -e "UPDATE users SET password = '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'admin@ordershop.ru';"
```

4. **Конфигурация Backend**

```bash
cd backend
cp .env.example .env
# Отредактируйте .env, указав ваши данные БД
```

**backend/.env:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ваш_пароль
DB_NAME=ordershop
JWT_SECRET=ваш_секретный_ключ
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

5. **Запуск**

```bash
# Из корня проекта - оба сервера сразу
npm run dev

# Или по отдельности
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Доступ:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Деплой на Linux сервер

Для развёртывания на production сервере используйте готовый скрипт:

```bash
# 1. Загрузите скрипт на сервер
scp deploy.sh user@server:/tmp/

# 2. Запустите от root
ssh user@server
sudo bash /tmp/deploy.sh
```

Или следуйте подробной инструкции в [DEPLOY_LINUX.md](DEPLOY_LINUX.md)

**Автоматический скрипт включает:**
- ✅ Установка Node.js, MySQL, Nginx
- ✅ Настройка фаервола и безопасности
- ✅ Настройка SSL (Let's Encrypt)
- ✅ Создание systemd сервисов
- ✅ Настройка автоматических бэкапов
- ✅ Мониторинг здоровья сервисов

## ⚙️ Настройка

### Онлайн-оплата (ЮMoney)

1. Зарегистрируйте приложение: https://yoomoney.ru/myservices/myapps
2. Получите `client_id` и `client_secret`
3. Добавьте в `.env`:

```env
YOOMONEY_CLIENT_ID=ваш_client_id
YOOMONEY_CLIENT_SECRET=ваш_client_secret
YOOMONEY_ACCOUNT=41001XXXXXXXXXXXX
YOOMONEY_REDIRECT_URI=http://localhost:5173/payment/callback
YOOMONEY_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
```

4. Импортируйте миграцию:
```bash
mysql -u root -p ordershop < backend/database/add_online_payment.sql
```

5. Пройдите OAuth2 авторизацию (подробнее в `INSTALL.md`)

### Бухгалтерский учёт

Автоматически создаёт транзакции при доставке заказа. Страница: `/admin/accounting`

## 📚 API Документация

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль

### Products
- `GET /api/products` - Список товаров
- `GET /api/products/:id` - Товар по ID
- `POST /api/products` - Создать (admin)
- `PUT /api/products/:id` - Обновить (admin)
- `DELETE /api/products/:id` - Удалить (admin)

### Orders
- `POST /api/orders` - Создать заказ
- `GET /api/orders/my` - Мои заказы
- `GET /api/orders/:id` - Детали заказа
- `PUT /api/orders/:id/status` - Обновить статус (admin)

### Payment (ЮMoney)
- `GET /api/payment/auth-url` - OAuth2 авторизация
- `POST /api/payment/create` - Создание платежа
- `POST /api/payment/webhook` - Webhook от ЮMoney

### Transactions (Бухгалтерия)
- `GET /api/transactions` - Список транзакций
- `GET /api/transactions/stats` - Статистика
- `POST /api/transactions` - Создать транзакцию

### Reports
- `GET /api/reports/export/excel` - Экспорт в Excel
- `GET /api/reports/export/csv` - Экспорт в CSV

Полная документация в `INSTALL.md`.

## 🎯 Функционал

### Админ-панель
- **Дашборд**: Статистика, последние заказы
- **Заказы**: Управление, фильтры, статусы
- **Товары**: CRUD, категории, изображения
- **Пользователи**: Управление ролями
- **Бухгалтерия**: Доходы/расходы, отчёты
- **Настройки**: Доставка, оплата, контакты

### Уведомления
- 🔔 Звуковое оповещение о новых заказах
- 📱 Браузерные push-уведомления
- ⏰ Автообновление каждые 5-10 секунд

### Оплата
- 💵 Наличные
- 💳 Карта при получении
- 🌐 Онлайн через ЮMoney

## 👥 Команда

Разработано и поддерживается командой OrderShop.

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📁 Скрипты и утилиты

### deploy.sh
Автоматический скрипт для развёртывания на Linux сервере.
[Инструкция](DEPLOY_LINUX.md)

### backup.sh
Скрипт для автоматических бэкапов базы данных и файлов.
Настройте cron для ежедневного запуска:
```bash
0 2 * * * /var/www/ordershop/backup.sh
```

### healthcheck.sh
Скрипт для проверки здоровья сервисов.
Запускайте каждые 5 минут:
```bash
*/5 * * * * /var/www/ordershop/healthcheck.sh
```

## 📞 Поддержка

- Документация: `INSTALL.md`
- Email: support@ordershop.ru
- Telegram: @ordershop_support

## 🙏 Благодарности

- [Vue.js](https://vuejs.org/)
- [Express](https://expressjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [ЮMoney](https://yoomoney.ru/)

---

**Version:** 1.0.0  
**Last Updated:** 2024-02-24
