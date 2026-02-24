-- Seed данные для OrderShop
USE ordershop;

-- Категории
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Бургеры', 'burgers', 'Сочные бургеры на любой вкус', 'fa-burger', 1),
('Пицца', 'pizza', 'Классическая итальянская пицца', 'fa-pizza-slice', 2),
('Суши и роллы', 'sushi', 'Свежие суши и роллы', 'fa-fish', 3),
('Напитки', 'drinks', 'Прохладительные и горячие напитки', 'fa-mug-hot', 4),
('Закуски', 'snacks', 'Вкусные закуски', 'fa-bread-slice', 5),
('Десерты', 'desserts', 'Сладкое завершение трапезы', 'fa-ice-cream', 6),
('Салаты', 'salads', 'Свежие салаты', 'fa-leaf', 7);

-- Товары
INSERT INTO products (name, slug, description, price, old_price, category_id, image, is_popular, is_new, stock_quantity, rating, review_count) VALUES
('Чизбургер Классик', 'cheeseburger-classic', 'Классический бургер с говядиной, сыром чеддер, маринованными огурцами и фирменным соусом', 499, 599, 1, '/images/products/cheeseburger.jpg', TRUE, FALSE, 100, 4.7, 156),
('Бургер Делюкс', 'burger-deluxe', 'Премиум бургер с мраморной говядиной, карамелизированным луком и трюфельным соусом', 799, NULL, 1, '/images/products/deluxe-burger.jpg', TRUE, TRUE, 50, 4.9, 89),
('Вегги Бургер', 'veggie-burger', 'Овощной бургер с авокадо, томатами и хумусом', 449, NULL, 1, '/images/products/veggie-burger.jpg', FALSE, TRUE, 80, 4.5, 42),
('Пепперони', 'pizza-pepperoni', 'Классическая пицца с пикантной пепперони и моцареллой', 699, 799, 2, '/images/products/pepperoni.jpg', TRUE, FALSE, 100, 4.8, 234),
('Маргарита', 'pizza-margarita', 'Традиционная итальянская пицца с томатами и базиликом', 549, NULL, 2, '/images/products/margarita.jpg', FALSE, FALSE, 100, 4.6, 178),
('Четыре сыра', 'pizza-four-cheese', 'Изысканная пицца с четырьмя видами сыра', 749, NULL, 2, '/images/products/four-cheese.jpg', TRUE, FALSE, 80, 4.7, 145),
('Филадельфия', 'sushi-philadelphia', 'Ролл с лососем, сливочным сыром и огурцом', 599, NULL, 3, '/images/products/philadelphia.jpg', TRUE, FALSE, 60, 4.8, 312),
('Калифорния', 'sushi-california', 'Ролл с крабом, авокадо и икрой тобико', 549, NULL, 3, '/images/products/california.jpg', TRUE, FALSE, 60, 4.7, 267),
('Дракон', 'sushi-dragon', 'Запеченный ролл с угрем и сливочным сыром', 699, NULL, 3, '/images/products/dragon.jpg', TRUE, TRUE, 40, 4.9, 198),
('Кока-Кола', 'coca-cola', 'Классический прохладительный напиток', 149, NULL, 4, '/images/products/coca-cola.jpg', FALSE, FALSE, 200, 4.5, 89),
('Лимонад Домашний', 'lemonade-homemade', 'Освежающий лимонад с мятой и лимоном', 249, NULL, 4, '/images/products/lemonade.jpg', TRUE, FALSE, 100, 4.6, 67),
('Капучино', 'cappuccino', 'Классический кофе с молочной пенкой', 299, NULL, 4, '/images/products/cappuccino.jpg', FALSE, FALSE, 100, 4.7, 145),
('Картофель фри', 'fries', 'Хрустящий картофель фри с фирменным соусом', 199, 249, 5, '/images/products/fries.jpg', TRUE, FALSE, 150, 4.4, 234),
('Луковые кольца', 'onion-rings', 'Золотистые луковые кольца в панировке', 249, NULL, 5, '/images/products/onion-rings.jpg', FALSE, FALSE, 100, 4.3, 156),
('Наггетсы', 'nuggets', 'Куриные наггетсы с соусом на выбор', 299, NULL, 5, '/images/products/nuggets.jpg', FALSE, FALSE, 120, 4.5, 189),
('Чизкейк Нью-Йорк', 'cheesecake-new-york', 'Классический чизкейк по нью-йоркскому рецепту', 399, NULL, 6, '/images/products/cheesecake.jpg', TRUE, FALSE, 50, 4.8, 267),
('Тирамису', 'tiramisu', 'Итальянский десерт с маскарпоне', 449, NULL, 6, '/images/products/tiramisu.jpg', TRUE, FALSE, 40, 4.9, 198),
('Брауни', 'brownie', 'Шоколадный брауни с шариком ванильного мороженого', 349, NULL, 6, '/images/products/brownie.jpg', FALSE, TRUE, 60, 4.7, 134),
('Цезарь с курицей', 'caesar-chicken', 'Классический салат цезарь с куриной грудкой', 449, NULL, 7, '/images/products/caesar.jpg', TRUE, FALSE, 80, 4.6, 178),
('Греческий', 'greek-salad', 'Свежий салат с фетой и оливками', 399, NULL, 7, '/images/products/greek.jpg', FALSE, FALSE, 80, 4.5, 145);

-- Пользователи (пароль для всех: admin123)
-- Хэш пароля: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@ordershop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Админ', 'Админов', '+7 (999) 000-00-01', 'admin'),
('moderator@ordershop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Модератор', 'Модераторов', '+7 (999) 000-00-02', 'moderator'),
('bartender@ordershop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Бармен', 'Барменов', '+7 (999) 000-00-03', 'bartender'),
('customer@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Иван', 'Иванов', '+7 (999) 000-00-04', 'customer');

-- Отзывы
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, is_verified) VALUES
(1, 4, 5, 'Отличный бургер!', 'Один из лучших чизбургеров что пробовал. Сочный, вкусный, рекомендую!', TRUE, TRUE),
(1, 4, 4, 'Хорошо', 'Вкусно, но немного дороговато', TRUE, TRUE),
(4, 4, 5, 'Любимая пицца', 'Заказываем уже много раз, всегда отлично!', TRUE, TRUE),
(7, 4, 5, 'Свежие роллы', 'Рыба свежая, рис правильно приготовлен. Супер!', TRUE, TRUE),
(16, 4, 5, 'Невероятный чизкейк', 'Лучший чизкейк в городе! Нежный, воздушный.', TRUE, TRUE);

-- Пример заказа
INSERT INTO orders (order_number, user_id, guest_name, guest_email, guest_phone, status, total_amount, discount_amount, delivery_fee, final_amount, payment_method, payment_status, notes) VALUES
('ORD-000001', 4, 'Иван Иванов', 'customer@test.com', '+7 (999) 000-00-04', 'delivered', 1547, 0, 299, 1846, 'card', 'paid', 'Домофон не работает, звонить'),
('ORD-000002', NULL, 'Петр Петров', 'petr@example.com', '+7 (999) 111-22-33', 'delivered', 2397, 100, 0, 2297, 'cash', 'paid', NULL),
('ORD-000003', 4, 'Иван Иванов', 'customer@test.com', '+7 (999) 000-00-04', 'ready', 898, 0, 299, 1197, 'online', 'paid', NULL);

INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES
(1, 1, 2, 499, 998),
(1, 13, 1, 199, 199),
(1, 10, 2, 149, 298),
(1, 16, 1, 399, 399),
(2, 4, 1, 699, 699),
(2, 7, 2, 599, 1198),
(2, 19, 1, 449, 449),
(3, 1, 1, 499, 499),
(3, 19, 1, 449, 449);

INSERT INTO deliveries (order_id, delivery_type_id, address, city, street, building, apartment, floor, entrance, intercom, delivery_instructions) VALUES
(1, 2, 'ул. Пушкина, д. 10, кв. 25', 'Москва', 'ул. Пушкина', '10', '25', '3', '2', '1234', 'Подъезд слева'),
(3, 2, 'пр. Ленина, д. 5, кв. 10', 'Москва', 'пр. Ленина', '5', '10', '2', '1', '5678', NULL);
