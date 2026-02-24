# OrderShop Backend

Серверная часть системы управления заказами ресторана.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка

```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Отредактируйте .env, указав ваши данные
```

**.env:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ваш_пароль
DB_NAME=ordershop
JWT_SECRET=ваш_секретный_ключ
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Опционально: ЮMoney
YOOMONEY_CLIENT_ID=ваш_client_id
YOOMONEY_CLIENT_SECRET=ваш_client_secret
YOOMONEY_ACCOUNT=41001XXXXXXXXXXXX
YOOMONEY_REDIRECT_URI=http://localhost:5173/payment/callback
YOOMONEY_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
```

### 3. База данных

```bash
# Создайте БД
mysql -u root -p -e "CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Импортируйте схему
mysql -u root -p ordershop < database/schema_full.sql

# Импортируйте тестовые данные
mysql -u root -p ordershop < database/seed.sql

# Опционально: онлайн-оплата
mysql -u root -p ordershop < database/add_online_payment.sql
```

### 4. Запуск

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 Структура

```
backend/
├── src/
│   ├── config/           # Конфигурация (БД, CORS, JWT)
│   ├── controllers/      # Контроллеры
│   │   ├── authController.ts       # Аутентификация
│   │   ├── orderController.ts      # Заказы
│   │   ├── productController.ts    # Товары
│   │   ├── paymentController.ts    # Оплата (ЮMoney)
│   │   ├── transactionController.ts # Бухгалтерия
│   │   ├── userController.ts       # Пользователи
│   │   └── ...
│   ├── middleware/       # Middleware (auth, CORS)
│   ├── routes/           # API роуты
│   └── index.ts          # Точка входа
├── database/
│   ├── schema_full.sql   # Полная схема БД
│   ├── seed.sql          # Тестовые данные
│   ├── add_online_payment.sql # Онлайн-оплата
│   └── README.md         # Документация БД
├── .env.example
└── package.json
```

## 🔌 API Endpoints

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

Полная документация в корневом `README.md`.

## 🛠 Технологии

- **Node.js** + **Express**
- **TypeScript**
- **MySQL** (mysql2)
- **JWT** (jsonwebtoken)
- **Bcrypt** (bcryptjs)
- **Axios**

## 📝 Тестирование

```bash
# Запуск тестов (если есть)
npm test
```

## 📦 Деплой

### Production сборка

```bash
npm run build
npm start
```

### Переменные окружения для production

- Установите `NODE_ENV=production`
- Используйте надёжный `JWT_SECRET`
- Настройте HTTPS
- Настройте логирование (Winston/Morgan)

## 🔐 Безопасность

- ✅ Хеширование паролей (bcrypt)
- ✅ JWT аутентификация
- ✅ CORS настройки
- ✅ Валидация данных
- ✅ SQL injection защита (prepared statements)

## 📞 Поддержка

Документация: корневой `README.md` и `INSTALL.md`
