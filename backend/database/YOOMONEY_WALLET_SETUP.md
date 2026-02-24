# Инструкция по настройке API кошелька ЮMoney (для физических лиц)

## 📋 Обзор

API кошелька ЮMoney позволяет принимать платежи с кошельков ЮMoney и банковских карт. Это решение для **физических лиц** (в отличие от ЮKassa для юридических лиц).

## 🚀 Настройка

### 1. Регистрация приложения в ЮMoney

1. Зайдите в свой кошелек ЮMoney (https://yoomoney.ru)
2. Перейдите на страницу регистрации приложения: https://yoomoney.ru/myservices/myapps
3. Нажмите "Создать приложение"
4. Заполните параметры:

| Параметр | Значение |
|----------|----------|
| Название для пользователей | OrderShop |
| Адрес сайта | https://ваш-сайт.ru |
| Почта для связи | ваш@email.com |
| Redirect URI | https://ваш-сайт.ru/payment/callback |
| Проверять подлинность приложения | ✅ Да (рекомендуется) |

5. Нажмите "Подтвердить"
6. Сохраните данные:
   - `client_id` - идентификатор приложения
   - `client_secret` - секретное слово (если включили проверку)

### 2. Получение номера кошелька

1. В личном кабинете ЮMoney скопируйте номер вашего кошелька
2. Это будет `YOOMONEY_ACCOUNT`

### 3. Конфигурация Backend

Откройте `backend/.env` и добавьте:

```env
# YooMoney Wallet API настройки
YOOMONEY_CLIENT_ID=ваш_client_id
YOOMONEY_CLIENT_SECRET=ваш_client_secret  # если включили проверку
YOOMONEY_ACCOUNT=41001XXXXXXXXXXXX  # номер вашего кошелька
YOOMONEY_REDIRECT_URI=https://ваш-сайт.ru/payment/callback
YOOMONEY_WEBHOOK_URL=https://ваш-сайт.ru/api/payment/webhook
```

### 4. Миграция базы данных

Выполните SQL скрипт:

```bash
mysql -u root -p ordershop < backend/database/add_online_payment.sql
```

### 5. Настройка уведомлений (Webhook)

1. Зайдите в настройки вашего приложения на https://yoomoney.ru/myservices/myapps
2. В разделе "HTTP-уведомления" укажите:
   ```
   https://ваш-сайт.ru/api/payment/webhook
   ```
3. Выберите события:
   - ✅ Поступление перевода (p2p-incoming)

### 6. Авторизация приложения (OAuth2)

Первый шаг - получение токена авторизации:

**Вариант A: Через браузер**
1. Откройте URL в браузере:
   ```
   http://localhost:3000/api/payment/auth-url
   ```
2. Скопируйте `authUrl` из ответа
3. Перейдите по ссылке
4. Войдите в кошелек ЮMoney
5. Подтвердите права доступа
6. Вас перенаправит на `redirect_uri?code=XXXXX`
7. Скопируйте код из URL

**Вариант B: Через API**
```bash
curl http://localhost:3000/api/payment/auth-url
```

### 7. Обмен кода на токен

После получения кода авторизации:

```bash
curl -X POST http://localhost:3000/api/payment/callback?code=ВАШ_КОД
```

Токен сохранится в базе данных автоматически.

## 💳 Как это работает?

### Схема работы:

```
1. Регистрация приложения в ЮMoney
   ↓
2. Получение токена авторизации (OAuth2)
   ↓
3. Клиент создаёт заказ с онлайн-оплатой
   ↓
4. Backend создаёт запрос на перевод через API
   ↓
5. Клиент получает ссылку на оплату (если требуется)
   ↓
6. Клиент оплачивает через сайт ЮMoney
   ↓
7. ЮMoney отправляет webhook на ваш сервер
   ↓
8. Backend обновляет статус заказа
   ↓
9. Создаётся транзакция в бухгалтерии
```

### Автоматические действия при оплате:

1. ✅ Статус оплаты: `pending` → `succeeded`
2. ✅ Статус заказа: `pending` → `confirmed`
3. ✅ Создаётся транзакция в бухгалтерии
4. ✅ Запись в лог платежей

## 🔌 API Endpoints

### Получение URL для авторизации

```http
GET /api/payment/auth-url
```

**Ответ:**
```json
{
  "authUrl": "https://yoomoney.ru/oauth/authorize?client_id=...&redirect_uri=...&scope=...",
  "message": "Перенаправьте пользователя на этот URL для авторизации"
}
```

### Обработка callback (получение токена)

```http
POST /api/payment/callback?code=CODE
```

**Ответ:**
```json
{
  "message": "Токен успешно получен",
  "token_type": "bearer",
  "expires_in": 31536000
}
```

### Создание платежа

```http
POST /api/payment/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 123,
  "amount": 1500.00,
  "description": "Оплата заказа"
}
```

**Ответ:**
```json
{
  "success": true,
  "request_id": "request-id-123",
  "status": "ext_auth_required",
  "balance": 5000.00,
  "paymentUrl": "https://yoomoney.ru/checkout/...",
  "message": "Платёж создан"
}
```

### Подтверждение платежа

```http
POST /api/payment/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestId": "request-id-123",
  "ext_auth_params": {...}
}
```

### Информация о кошельке

```http
GET /api/payment/wallet-info
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "account": "41001XXXXXXXXXXXX",
  "balance": 5000.00,
  "currency": "RUB",
  "account_status": "named",
  "wallet_name": "Имя кошелька"
}
```

### История операций

```http
GET /api/payment/history?limit=10
Authorization: Bearer <token>
```

### Webhook (вызывается ЮMoney)

```http
POST /api/payment/webhook
Content-Type: application/json

{
  "notification_type": "p2p-incoming",
  "operation_id": "0000000000",
  "amount": 1500.00,
  "currency": "RUB",
  "datetime": "2024-02-24T15:30:00+03:00",
  "sender": "41001XXXXXXXXXX",
  "label": "123",
  "transaction_id": "1234567890"
}
```

### Проверка статуса

```http
GET /api/payment/order/:orderId/status
```

## 📱 Frontend

### Страница оплаты

Клиент создаёт заказ → выбирает "Онлайн оплата" → перенаправляется на `/payment/result`

На странице оплаты:
- Кнопка "Оплатить через ЮMoney"
- Статус заказа
- Результат оплаты

### Поток оплаты

1. Клиент нажимает "Оплатить"
2. Backend создаёт запрос на перевод
3. Если требуется подтверждение (`ext_auth_required`):
   - Показываем ссылку на оплату
   - Клиент переходит на сайт ЮMoney
   - Оплачивает перевод
4. ЮMoney отправляет webhook
5. Статус заказа обновляется

## 🧪 Тестирование

### Пошаговое тестирование:

1. **Авторизация:**
   ```bash
   curl http://localhost:3000/api/payment/auth-url
   ```
   
2. **Перейдите по ссылке** из ответа
3. **Подтвердите права** в кошельке ЮMoney
4. **Скопируйте код** из redirect URL
5. **Получите токен:**
   ```bash
   curl -X POST "http://localhost:3000/api/payment/callback?code=ВАШ_КОД"
   ```

6. **Создайте тестовый заказ** через frontend
7. **Создайте платёж:**
   ```bash
   curl -X POST http://localhost:3000/api/payment/create \
     -H "Content-Type: application/json" \
     -d '{"orderId": 1}'
   ```

8. **Оплатите** через сайт ЮMoney (если требуется)
9. **Проверьте webhook** в логах

## 🛠 Структура БД

### Таблица `settings` (для токена)

| setting_key | setting_value |
|-------------|---------------|
| yoomoney_access_token | Y3... (токен) |

### Таблица `orders` (новые поля)

| Поле | Тип | Описание |
|------|-----|----------|
| payment_type | VARCHAR(20) | cash, card, online |
| payment_status | VARCHAR(20) | pending, succeeded, canceled |
| payment_id | VARCHAR(100) | ID запроса на перевод |
| payment_paid_at | DATETIME | Дата оплаты |

### Таблица `payment_logs`

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT | ID записи |
| order_id | INT | ID заказа |
| payment_id | VARCHAR(100) | ID платежа |
| event_type | VARCHAR(50) | Тип события |
| event_data | TEXT | Данные (JSON) |
| amount | DECIMAL(10,2) | Сумма |
| status | VARCHAR(20) | Статус |

## ⚠️ Важные замечания

1. **Токен авторизации**
   - Токен хранится 1 год
   - Храните в базе данных, не в коде
   - При истечении нужно пройти авторизацию снова

2. **Безопасность**
   - Используйте HTTPS в production
   - Не публикуйте `client_secret`
   - Проверяйте подписи webhook (опционально)

3. **Комиссия**
   - ЮMoney берёт комиссию с получателя
   - Учитывайте это в ценах

4. **Лимиты**
   - Максимальный платёж: 15 000 ₽ (для анонимных)
   - Максимальный платёж: 60 000 ₽ (для именных)
   - Максимальный платёж: 250 000 ₽ (для идентифицированных)

## 🔗 Полезные ссылки

- Документация: https://yoomoney.ru/docs/wallet
- Регистрация приложения: https://yoomoney.ru/myservices/myapps
- OAuth2 спецификация: https://yoomoney.ru/docs/wallet/quickstart/oauth2
- API платежей: https://yoomoney.ru/docs/wallet/payment-api

## 📞 Поддержка

При проблемах:
1. Проверьте логи backend
2. Проверьте токен авторизации
3. Убедитесь, что приложение зарегистрировано
4. Проверьте настройки webhook
