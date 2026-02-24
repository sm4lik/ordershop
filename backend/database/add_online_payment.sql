-- Миграция: Добавление полей для онлайн-оплаты в таблицу orders
-- Выполните этот скрипт для добавления поддержки онлайн-оплаты

-- Добавляем новые поля в таблицу orders
ALTER TABLE `orders` 
ADD COLUMN `payment_type` VARCHAR(20) DEFAULT 'cash' COMMENT 'Тип оплаты: cash, card, online' AFTER `payment_method`,
ADD COLUMN `payment_status` VARCHAR(20) DEFAULT 'pending' COMMENT 'Статус оплаты: pending, succeeded, canceled, refunded' AFTER `payment_type`,
ADD COLUMN `payment_id` VARCHAR(100) NULL COMMENT 'ID платежа в ЮKassa' AFTER `payment_status`,
ADD COLUMN `payment_paid_at` DATETIME NULL COMMENT 'Дата успешной оплаты' AFTER `payment_id`,
ADD INDEX `idx_payment_status` (`payment_status`),
ADD INDEX `idx_payment_id` (`payment_id`);

-- Обновляем существующие заказы (устанавливаем payment_type = payment_method)
UPDATE `orders` 
SET `payment_type` = `payment_method` 
WHERE `payment_type` IS NULL;

-- Обновляем статусы оплаты для доставленных заказов
UPDATE `orders` 
SET `payment_status` = 'succeeded', 
    `payment_paid_at` = `delivered_at` 
WHERE `status` = 'delivered';

-- Создаём таблицу для истории платежей
CREATE TABLE IF NOT EXISTS `payment_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT 'ID заказа',
  `payment_id` VARCHAR(100) NOT NULL COMMENT 'ID платежа в ЮKassa',
  `event_type` VARCHAR(50) NOT NULL COMMENT 'Тип события: payment.succeeded, payment.canceled, и т.д.',
  `event_data` TEXT COMMENT 'Данные события в JSON',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Сумма платежа',
  `status` VARCHAR(20) NOT NULL COMMENT 'Статус платежа',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_order` (`order_id`),
  INDEX `idx_payment` (`payment_id`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Лог событий оплаты';
