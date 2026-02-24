# Инструкция по запуску OrderShop

## Требования

- Node.js 18+ 
- MySQL 8+
- npm или yarn

## 1. Установка зависимостей

### Корневой проект
```bash
cd d:\РАБОЧАЯСТРЕДА\OrderShop
npm install
```

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

Или установите всё одной командой из корня:
```bash
npm run install:all
```

## 2. Настройка базы данных

### Создайте базу данных
```sql
CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Импортируйте полную схему
```bash
mysql -u root -p ordershop < backend/database/schema_full.sql
```

**ИЛИ** по отдельности:

#### Импортируйте схему
```bash
mysql -u root -p ordershop < backend/database/schema.sql
```

#### Импортируйте тестовые данные
```bash
mysql -u root -p ordershop < backend/database/seed.sql
```

#### Импортируйте бухгалтерские таблицы
```bash
mysql -u root -p ordershop < backend/database/init_accounting.sql
```

#### Миграция существующих заказов (опционально)
Если у вас уже есть заказы, выполните скрипт для создания транзакций:
```bash
mysql -u root -p ordershop < backend/database/migrate_existing_orders.sql
```

#### Настройка онлайн-оплаты (опционально)
1. Импортируйте миграцию для оплаты:
```bash
mysql -u root -p ordershop < backend/database/add_online_payment.sql
```

2. Настройте `.env` файл (см. ниже)

Или выполните SQL файлы через phpMyAdmin/MySQL Workbench.

**Примечание:** Используйте `schema_full.sql` для нового приложения - этот файл содержит все таблицы, представления, процедуры и начальные данные.

## 3. Конфигурация Backend

Откройте `backend/.env` и настройте подключение к БД:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ваш_пароль
DB_NAME=ordershop
JWT_SECRET=ваш_секретный_ключ
JWT_EXPIRES_IN=7d
NODE_ENV=development

# YooMoney (ЮMoney Wallet API) настройки (опционально)
YOOMONEY_CLIENT_ID=ваш_client_id
YOOMONEY_CLIENT_SECRET=ваш_client_secret  # если включили проверку подлинности
YOOMONEY_ACCOUNT=41001XXXXXXXXXXXX  # номер вашего кошелька
YOOMONEY_REDIRECT_URI=http://localhost:5173/payment/callback
YOOMONEY_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
```

**Важно:** Для использования API кошелька ЮMoney необходимо:
1. Зарегистрировать приложение в личном кабинете ЮMoney
2. Получить токен авторизации через OAuth2
3. Настроить webhook для уведомлений

Подробная инструкция: `backend/database/YOOMONEY_WALLET_SETUP.md`

## 4. Запуск проекта

### Запуск обоих серверов одновременно (из корня)
```bash
npm run dev
```

### Или по отдельности

**Backend (терминал 1):**
```bash
cd backend
npm run dev
```
Backend доступен по адресу: http://localhost:3000

**Frontend (терминал 2):**
```bash
cd frontend
npm run dev
```
Frontend доступен по адресу: http://localhost:5173

## 5. Тестовые учётные данные

После импорта seed-данных используйте эти аккаунты:

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@ordershop.com | admin123 |
| Модератор | moderator@ordershop.com | admin123 |
| Бармен | bartender@ordershop.com | admin123 |
| Клиент | customer@test.com | admin123 |

## 6. Доступные маршруты

### Пользовательская часть
- **Главная:** http://localhost:5173/
- **Меню:** http://localhost:5173/menu
- **Корзина:** http://localhost:5173/cart
- **Вход:** http://localhost:5173/login
- **Регистрация:** http://localhost:5173/register

### Админ-панель
- **Дашборд:** http://localhost:5173/admin
- **Заказы:** http://localhost:5173/admin/orders
- **Товары:** http://localhost:5173/admin/products
- **Категории:** http://localhost:5173/admin/categories
- **Пользователи:** http://localhost:5173/admin/users
- **Бухгалтерия:** http://localhost:5173/admin/accounting

## 7. API Endpoints

### Auth
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `GET /api/auth/profile` — Профиль (требуется токен)

### Products
- `GET /api/products` — Список товаров
- `GET /api/products/:id` — Товар по ID
- `GET /api/products/popular` — Популярные товары
- `GET /api/products/new` — Новинки

### Categories
- `GET /api/categories` — Список категорий
- `GET /api/categories/:id` — Категория по ID

### Orders
- `POST /api/orders` — Создать заказ
- `GET /api/orders/my` — Мои заказы
- `GET /api/orders/:id` — Детали заказа
- `GET /api/orders/number/:number` — Поиск по номеру

### Reviews
- `GET /api/reviews/product/:productId` — Отзывы к товару
- `POST /api/reviews` — Создать отзыв

### Transactions (Бухгалтерия)
- `GET /api/transactions` — Список транзакций
- `GET /api/transactions/stats` — Статистика по транзакциям
- `GET /api/transactions/categories` — Категории транзакций
- `POST /api/transactions` — Создать транзакцию
- `PUT /api/transactions/:id` — Обновить транзакцию
- `DELETE /api/transactions/:id` — Удалить транзакцию

### Reports (Экспорт)
- `GET /api/reports/export/excel` — Экспорт в Excel
- `GET /api/reports/export/csv` — Экспорт в CSV
- `GET /api/reports/export/period` — Отчёт по периодам
- `GET /api/reports/export/category` — Отчёт по категориям

### Payment (Онлайн-оплата через ЮMoney)
- `GET /api/payment/auth-url` — Получение URL для авторизации OAuth2
- `POST /api/payment/callback` — Обработка callback, получение токена
- `POST /api/payment/create` — Создание платежа
- `POST /api/payment/confirm` — Подтверждение платежа
- `GET /api/payment/wallet-info` — Информация о кошельке (admin)
- `GET /api/payment/history` — История операций (admin)
- `GET /api/payment/order/:orderId/status` — Статус оплаты заказа
- `POST /api/payment/webhook` — Webhook от ЮMoney

## 8. Сборка для production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Файлы сборки будут в `frontend/dist/`

## 9. Структура проекта

```
OrderShop/
├── backend/
│   ├── src/
│   │   ├── config/         # Конфигурация
│   │   ├── controllers/    # Контроллеры
│   │   │   ├── transactionController.ts  # Бухгалтерия
│   │   │   └── reportController.ts       # Экспорт отчётов
│   │   ├── middleware/     # Middleware (auth)
│   │   ├── routes/         # Маршруты API
│   │   └── index.ts        # Точка входа
│   ├── database/
│   │   ├── schema.sql              # Схема БД
│   │   ├── seed.sql                # Тестовые данные
│   │   └── init_accounting.sql     # Бухгалтерские таблицы
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # API клиент
│   │   ├── components/     # Vue компоненты
│   │   ├── composables/    # Vue composables
│   │   ├── router/         # Vue Router
│   │   ├── stores/         # Pinia stores
│   │   ├── styles/         # CSS стили
│   │   ├── types/          # TypeScript типы
│   │   ├── views/          # Страницы
│   │   │   ├── admin/      # Админ-панель
│   │   │   │   └── AccountingView.vue  # Бухгалтерия
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── package.json
└── README.md
```

## 10. Возможные проблемы и решения

### Ошибка подключения к БД
- Проверьте `DB_USER`, `DB_PASSWORD` в `backend/.env`
- Убедитесь, что MySQL запущен

### Ошибка CORS
- Убедитесь, что backend и frontend запущены на портах 3000 и 5173
- Проверьте `corsOptions` в `backend/src/config/index.ts`

### Товары не отображаются
- Импортируйте `seed.sql` для тестовых данных
- Проверьте, что товары активны (`is_active = TRUE`)

## Поддержка

При возникновении проблем проверьте логи в консоли серверов.
