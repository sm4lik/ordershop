# OrderShop - Changelog

## Version 1.0.0 (2024-02-24)

### ✨ Новые возможности

#### Бухгалтерский учёт
- ✅ Таблицы `transactions` и `transaction_categories`
- ✅ Автоматическое создание транзакций при доставке заказа
- ✅ Страница `/admin/accounting` с фильтрами и статистикой
- ✅ Экспорт в Excel/CSV
- ✅ Отчёты по периодам и категориям

#### Онлайн-оплата
- ✅ Интеграция с API кошелька ЮMoney (OAuth2)
- ✅ Страница оплаты `/payment/result`
- ✅ Webhook для автоматического подтверждения
- ✅ Автоматическое создание транзакций при оплате

#### Уведомления
- ✅ Звуковое оповещение о новых заказах
- ✅ Браузерные push-уведомления
- ✅ Автообновление списка заказов (5-10 сек)
- ✅ Визуальный индикатор новых заказов

#### Админ-панель
- ✅ Обновлённый интерфейс AdminPanel
- ✅ Управление пользователями
- ✅ Статистика и дашборд

### 🔧 Исправления

#### Backend
- ✅ Исправлен `settingsController` (таблица `settings` вместо `shop_settings`)
- ✅ Исправлен `productController` (удалены несуществующие поля: `sku`, `volume`, `alcohol_percentage`)
- ✅ Исправлен `productController.getPopular` (сортировка по `created_at` вместо `review_count`)
- ✅ Исправлен `userController` (удалено поле `avatar`)
- ✅ Исправлен `settingsController.update` (обновление `delivery_types` по `id`)

#### Frontend
- ✅ Добавлена страница `PaymentView.vue` для онлайн-оплаты
- ✅ Обновлён `CheckoutView.vue` с поддержкой онлайн-оплаты
- ✅ Добавлены composables: `useSoundNotification.ts`, `useOrderMonitoring.ts`
- ✅ Обновлён `AdminPanel.vue` с вкладкой бухгалтерии

#### База данных
- ✅ Создан полный файл схемы `schema_full.sql`
- ✅ Добавлены миграции: `add_online_payment.sql`, `init_accounting.sql`
- ✅ Создан файл для миграции существующих заказов

### 📝 Документация

- ✅ Обновлён `README.md` с полным описанием проекта
- ✅ Обновлён `INSTALL.md` с инструкциями
- ✅ Создан `SCHEMA_README.md`
- ✅ Создан `YOOKASSA_SETUP_GUIDE.md`
- ✅ Создан `ORDER_ACCOUNTING_GUIDE.md`
- ✅ Создан `.gitignore`

### 🗑 Удалено

- ❌ Удалены лишние поля из контроллеров
- ❌ Удалены несуществующие таблицы из запросов

### 📦 Зависимости

#### Backend
```json
{
  "axios": "^1.x",
  "bcrypt": "^5.x",
  "cors": "^2.x",
  "dotenv": "^16.x",
  "express": "^4.x",
  "jsonwebtoken": "^9.x",
  "mysql2": "^3.x",
  "xlsx": "^0.18.x",
  "json2csv": "^6.x"
}
```

#### Frontend
```json
{
  "vue": "^3.4.x",
  "vue-router": "^4.2.x",
  "pinia": "^2.1.x",
  "axios": "^1.6.x",
  "swiper": "^11.x",
  "tailwindcss": "^3.4.x",
  "vite": "^5.1.x",
  "typescript": "^5.3.x"
}
```

### 🚀 Деплой

#### Требования
- Node.js 18+
- MySQL 8+
- HTTPS (для продакшена)

#### Развёртывание
1. Клонировать репозиторий
2. Установить зависимости: `npm run install:all`
3. Настроить БД: импортировать `schema_full.sql`
4. Настроить `.env`
5. Запустить: `npm run dev`

### 📋 Известные проблемы

- Нет тестов (рекомендуется добавить Jest/Vitest)
- Нет Docker конфигурации (можно добавить)
- Логирование только в консоль (рекомендуется Winston/Morgan)

### 🔜 Планы

- [ ] Мобильное приложение
- [ ] Telegram бот для уведомлений
- [ ] SMS уведомления
- [ ] Система лояльности
- [ ] Промокоды
- [ ] Многоязычность
- [ ] Тесты (unit, e2e)
- [ ] Docker контейнеризация

---

**Breaking Changes:** Нет  
**Migration Required:** Да (импортировать `schema_full.sql`)
