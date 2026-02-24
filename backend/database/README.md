# База данных OrderShop

## 📋 Файлы

### Основные
- **schema_full.sql** - Полная схема базы данных (все таблицы, представления, процедуры, триггеры)
- **seed.sql** - Тестовые данные (категории, типы доставки, настройки)
- **add_online_payment.sql** - Миграция для онлайн-оплаты (ЮMoney)

### Дополнительные
- **YOOMONEY_WALLET_SETUP.md** - Инструкция по настройке онлайн-оплаты

## 🚀 Быстрый старт

### 1. Создание базы данных

```bash
mysql -u root -p -e "CREATE DATABASE ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Импорт схемы

```bash
mysql -u root -p ordershop < schema_full.sql
```

### 3. Импорт тестовых данных

```bash
mysql -u root -p ordershop < seed.sql
```

### 4. Настройка онлайн-оплаты (опционально)

```bash
mysql -u root -p ordershop < add_online_payment.sql
```

## 📊 Структура базы данных

### Таблицы (13)

1. **users** - Пользователи
2. **categories** - Категории товаров
3. **products** - Товары
4. **orders** - Заказы
5. **order_items** - Позиции заказа
6. **delivery_types** - Типы доставки
7. **deliveries** - Доставки
8. **order_status_history** - История статусов
9. **reviews** - Отзывы
10. **settings** - Настройки
11. **transaction_categories** - Категории транзакций
12. **transactions** - Транзакции
13. **payment_logs** - Логи платежей

### Представления (2)

- **active_products_view** - Активные товары с категориями
- **daily_order_stats** - Статистика по дням

### Процедуры (2)

- **get_order_stats(start_date, end_date)** - Статистика заказов
- **update_order_status(order_id, status, user_id, comment)** - Обновление статуса

### Триггеры (1)

- **after_order_delivered** - Авто-создание транзакции при доставке

## 🔐 Пользователь по умолчанию

| Email | Пароль | Роль |
|-------|--------|------|
| admin@ordershop.ru | admin123 | admin |

**Важно:** После первого входа смените пароль!

```sql
UPDATE users SET password = '$2a$10$новый_хеш' WHERE email = 'admin@ordershop.ru';
```

## 📝 Примечания

- Кодировка: `utf8mb4`
- Движок: `InnoDB`
- Часовой пояс: UTC
