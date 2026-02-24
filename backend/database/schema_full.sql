-- OrderShop Database Schema
-- Полная схема базы данных для рабочего приложения
-- Версия: 2024-02-24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Структура базы данных
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `ordershop` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ordershop`;

-- --------------------------------------------------------
-- Таблица пользователей
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50),
  `last_name` VARCHAR(50),
  `phone` VARCHAR(20),
  `role` ENUM('customer', 'moderator', 'bartender', 'admin') DEFAULT 'customer',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица категорий товаров
-- --------------------------------------------------------

CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(50) DEFAULT 'fa-box',
  `color` VARCHAR(20) DEFAULT 'primary',
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица товаров
-- --------------------------------------------------------

CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `old_price` DECIMAL(10,2),
  `image` VARCHAR(500),
  `images` JSON,
  `category_id` INT,
  `is_popular` BOOLEAN DEFAULT FALSE,
  `is_new` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `weight` INT COMMENT 'Вес в граммах',
  `composition` TEXT,
  `nutritional_value` JSON,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_popular` (`is_popular`),
  INDEX `idx_new` (`is_new`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица заказов
-- --------------------------------------------------------

CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(20) NOT NULL UNIQUE,
  `user_id` INT,
  `guest_email` VARCHAR(100),
  `guest_phone` VARCHAR(20),
  `guest_name` VARCHAR(100),
  `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') DEFAULT 'pending',
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `delivery_fee` DECIMAL(10,2) DEFAULT 0,
  `final_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(20) DEFAULT 'cash',
  `payment_type` VARCHAR(20) DEFAULT 'cash' COMMENT 'Тип оплаты: cash, card, online',
  `payment_status` VARCHAR(20) DEFAULT 'pending' COMMENT 'Статус оплаты: pending, succeeded, canceled, refunded',
  `payment_id` VARCHAR(100) NULL COMMENT 'ID платежа в ЮMoney',
  `payment_paid_at` DATETIME NULL COMMENT 'Дата успешной оплаты',
  `notes` TEXT,
  `confirmed_at` DATETIME,
  `prepared_at` DATETIME,
  `delivered_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_payment_id` (`payment_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица позиций заказа
-- --------------------------------------------------------

CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица типов доставки
-- --------------------------------------------------------

CREATE TABLE `delivery_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `fee` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `free_from_amount` DECIMAL(10,2) DEFAULT 0,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица доставок
-- --------------------------------------------------------

CREATE TABLE `deliveries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `delivery_type_id` INT,
  `address` TEXT,
  `city` VARCHAR(100),
  `street` VARCHAR(200),
  `building` VARCHAR(20),
  `apartment` VARCHAR(20),
  `floor` VARCHAR(10),
  `entrance` VARCHAR(10),
  `intercom` VARCHAR(20),
  `delivery_instructions` TEXT,
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`delivery_type_id`) REFERENCES `delivery_types`(`id`) ON DELETE SET NULL,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица истории статусов заказа
-- --------------------------------------------------------

CREATE TABLE `order_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `comment` TEXT,
  `changed_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица отзывов
-- --------------------------------------------------------

CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT,
  `guest_name` VARCHAR(100),
  `guest_email` VARCHAR(100),
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `is_helpful` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_approved` (`is_approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица настроек
-- --------------------------------------------------------

CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `setting_type` VARCHAR(20) DEFAULT 'string',
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Таблица категорий транзакций (Бухгалтерия)
-- --------------------------------------------------------

CREATE TABLE `transaction_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'Тип категории',
  `icon` VARCHAR(50) DEFAULT 'fa-folder' COMMENT 'Иконка FontAwesome',
  `color` VARCHAR(20) DEFAULT 'gray' COMMENT 'Цвет категории',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Активна ли категория',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Категории транзакций';

-- --------------------------------------------------------
-- Таблица транзакций (Бухгалтерия)
-- --------------------------------------------------------

CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'Тип: доход/расход',
  `category_id` INT NOT NULL COMMENT 'Категория транзакции',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Сумма',
  `description` TEXT COMMENT 'Описание',
  `order_id` INT NULL COMMENT 'Связь с заказом (если есть)',
  `payment_method` VARCHAR(50) NULL COMMENT 'Способ оплаты',
  `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата операции',
  `created_by` INT NULL COMMENT 'Кто создал (пользователь)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `transaction_categories`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_type` (`type`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_date` (`transaction_date`),
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Бухгалтерские транзакции';

-- --------------------------------------------------------
-- Таблица логов платежей (Онлайн-оплата)
-- --------------------------------------------------------

CREATE TABLE `payment_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT 'ID заказа',
  `payment_id` VARCHAR(100) NOT NULL COMMENT 'ID платежа в ЮMoney',
  `event_type` VARCHAR(50) NOT NULL COMMENT 'Тип события',
  `event_data` TEXT COMMENT 'Данные события в JSON',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Сумма платежа',
  `status` VARCHAR(20) NOT NULL COMMENT 'Статус платежа',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_payment` (`payment_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Лог событий оплаты';

-- --------------------------------------------------------
-- Начальные данные
-- --------------------------------------------------------

-- Администратор по умолчанию (пароль: admin123)
INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `role`, `is_active`) VALUES
('admin@ordershop.ru', '$2a$10$HaWZ4apUipD.Ut65WvvZm.vxginIoosr6K1raNv5Rb6u4FK1krvO6', 'Админ', 'Админов', 'admin', TRUE);

-- Категории товаров
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `color`, `sort_order`) VALUES
('Бургеры', 'burgers', 'Сочные бургеры на любой вкус', 'fa-hamburger', 'orange', 1),
('Пицца', 'pizza', 'Итальянская пицца с доставкой', 'fa-pizza-slice', 'red', 2),
('Суши и роллы', 'sushi', 'Свежие суши и роллы', 'fa-fish', 'pink', 3),
('Напитки', 'drinks', 'Прохладительные напитки', 'fa-glass-whiskey', 'blue', 4),
('Закуски', 'snacks', 'Вкусные закуски', 'fa-utensils', 'yellow', 5);

-- Типы доставки
INSERT INTO `delivery_types` (`name`, `fee`, `free_from_amount`, `description`, `sort_order`) VALUES
('Самовывоз', 0, 0, 'Бесплатно, заберите сами', 1),
('Курьер', 199, 1500, 'Доставка курьером до двери', 2),
('Экспресс', 399, 2000, 'Срочная доставка за 1 час', 3);

-- Категории транзакций
INSERT INTO `transaction_categories` (`name`, `type`, `icon`, `color`, `is_active`) VALUES
('Продажа товаров', 'income', 'fa-cart-shopping', 'green', TRUE),
('Продажа через доставку', 'income', 'fa-motorcycle', 'blue', TRUE),
('Закупка продуктов', 'expense', 'fa-cart-flatbed', 'red', TRUE),
('Закупка упаковки', 'expense', 'fa-box', 'orange', TRUE),
('Аренда помещения', 'expense', 'fa-building', 'purple', TRUE),
('Зарплата сотрудников', 'expense', 'fa-money-bill-wave', 'indigo', TRUE),
('Коммунальные услуги', 'expense', 'fa-lightbulb', 'yellow', TRUE),
('Налоги и сборы', 'expense', 'fa-file-invoice-dollar', 'red', TRUE),
('Реклама и маркетинг', 'expense', 'fa-bullhorn', 'pink', TRUE),
('Обслуживание оборудования', 'expense', 'fa-blender', 'gray', TRUE),
('Банковские комиссии', 'expense', 'fa-university', 'cyan', TRUE),
('Прочие доходы', 'income', 'fa-plus-circle', 'teal', TRUE),
('Прочие расходы', 'expense', 'fa-minus-circle', 'brown', TRUE);

-- Настройки по умолчанию
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('contact_phone', '+7 (999) 000-00-00', 'string', 'Контактный телефон'),
('contact_email', 'info@ordershop.ru', 'string', 'Email для связи'),
('contact_city', 'Москва', 'string', 'Город'),
('contact_address', 'ул. Примерная, 1', 'string', 'Адрес'),
('contact_description', 'Вкусная еда с доставкой до двери', 'text', 'Описание'),
('open_time', '10:00', 'string', 'Время открытия'),
('close_time', '23:00', 'string', 'Время закрытия'),
('accept_orders', 'true', 'boolean', 'Принимать заказы'),
('payment_cash', 'true', 'boolean', 'Оплата наличными'),
('payment_card', 'true', 'boolean', 'Оплата картой'),
('payment_online', 'false', 'boolean', 'Онлайн оплата'),
('delivery_fee', '199', 'number', 'Стоимость доставки'),
('free_delivery_from', '1500', 'number', 'Бесплатная доставка от суммы');

COMMIT;

-- --------------------------------------------------------
-- Представления (Views)
-- --------------------------------------------------------

-- Активные товары с категориями
CREATE OR REPLACE VIEW `active_products_view` AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.old_price,
  p.image,
  p.category_id,
  c.name as category_name,
  c.slug as category_slug,
  p.is_popular,
  p.is_new,
  p.weight,
  p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE AND c.is_active = TRUE
ORDER BY p.sort_order, p.name;

-- Статистика заказов по дням
CREATE OR REPLACE VIEW `daily_order_stats` AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(CASE WHEN status = 'delivered' THEN final_amount ELSE 0 END) as delivered_amount,
  SUM(CASE WHEN status = 'cancelled' THEN final_amount ELSE 0 END) as cancelled_amount,
  AVG(final_amount) as avg_order_amount
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- --------------------------------------------------------
-- Хранимые процедуры
-- --------------------------------------------------------

DELIMITER $$

-- Процедура для получения статистики по заказам
CREATE PROCEDURE `get_order_stats`(
  IN start_date DATE,
  IN end_date DATE
)
BEGIN
  SELECT 
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'delivered' THEN final_amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END) as pending_amount,
    SUM(CASE WHEN status = 'cancelled' THEN final_amount ELSE 0 END) as cancelled_amount,
    AVG(final_amount) as avg_order_value
  FROM orders
  WHERE created_at BETWEEN start_date AND end_date;
END$$

-- Процедура для обновления статуса заказа
CREATE PROCEDURE `update_order_status`(
  IN p_order_id INT,
  IN p_status VARCHAR(50),
  IN p_user_id INT,
  IN p_comment TEXT
)
BEGIN
  DECLARE v_old_status VARCHAR(50);
  
  -- Получаем текущий статус
  SELECT status INTO v_old_status FROM orders WHERE id = p_order_id;
  
  -- Обновляем заказ
  UPDATE orders 
  SET status = p_status,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Добавляем запись в историю
  INSERT INTO order_status_history (order_id, status, comment, changed_by)
  VALUES (p_order_id, p_status, p_comment, p_user_id);
  
  -- Возвращаем новый статус
  SELECT p_status as new_status, v_old_status as old_status;
END$$

DELIMITER ;

-- --------------------------------------------------------
-- Триггеры
-- --------------------------------------------------------

DELIMITER $$

-- Триггер для автоматического создания транзакции при доставке заказа
CREATE TRIGGER `after_order_delivered`
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Создаём транзакцию дохода
    INSERT INTO transactions (type, category_id, amount, description, order_id, payment_method, transaction_date)
    SELECT 
      'income',
      tc.id,
      NEW.final_amount,
      CONCAT('Оплата заказа ', NEW.order_number),
      NEW.id,
      NEW.payment_method,
      NOW()
    FROM transaction_categories tc
    WHERE tc.type = 'income' 
      AND tc.name IN ('Продажа товаров', 'Продажа через доставку')
    LIMIT 1;
  END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------
-- Индексы для ускорения выборки
-- --------------------------------------------------------

-- Дополнительные составные индексы
CREATE INDEX `idx_orders_status_created` ON `orders` (`status`, `created_at`);
CREATE INDEX `idx_orders_user_status` ON `orders` (`user_id`, `status`);
CREATE INDEX `idx_products_category_active` ON `products` (`category_id`, `is_active`);
CREATE INDEX `idx_transactions_type_date` ON `transactions` (`type`, `transaction_date`);

-- --------------------------------------------------------
-- Примечания
-- --------------------------------------------------------

-- 1. Пароль администратора нужно захешировать через bcrypt
--    Пример для admin123:
--    UPDATE users SET password = '$2a$10$...' WHERE email = 'admin@ordershop.ru';
--
-- 2. Для генерации хеша пароля используйте:
--    Node.js: bcrypt.hash('admin123', 10)
--
-- 3. После импорта проверьте кодировку:
--    SHOW VARIABLES LIKE 'character_set%';
--
-- 4. Для продакшена настройте:
--    - SSL соединение с БД
--    - Регулярные бэкапы
--    - Мониторинг производительности
