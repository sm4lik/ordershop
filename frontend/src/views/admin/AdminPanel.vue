<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <span class="text-xl font-bold">Управление</span>
          </div>
          <nav class="flex items-center space-x-2">
            <!-- Кнопка включения/выключения звука -->
            <button 
              @click="toggleSound" 
              class="px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              :title="soundEnabled ? 'Звук включен' : 'Звук выключен'"
            >
              <i :class="soundEnabled ? 'fa-solid fa-bell text-green-400' : 'fa-solid fa-bell-slash text-gray-400'"></i>
            </button>
            
            <!-- Кнопка теста звука -->
            <button 
              @click="handleTestSound" 
              class="px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-blue-400"
              title="Проверить звук"
            >
              <i class='fa-solid fa-volume-high'></i>
            </button>
            
            <button @click="loadDashboard(); loadOrders()" :disabled="refreshing"
                    class="px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Обновить данные">
              <i :class="refreshing ? 'fa-solid fa-spinner fa-spin animate-spin' : 'fa fa-refresh'"></i>
            </button>
            <button @click="currentTab = 'dashboard'"
                    :class="currentTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa-solid fa-home mr-2'></i>Главная
            </button>
            <button @click="currentTab = 'orders'" 
                    :class="currentTab === 'orders' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa-solid fa-box mr-2'></i>Заказы
            </button>
            <button @click="currentTab = 'products'" 
                    :class="currentTab === 'products' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa fa-bars mr-2'></i>Товары
            </button>
            <button @click="currentTab = 'categories'" 
                    :class="currentTab === 'categories' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa fa-grip mr-2'></i>Категории
            </button>
            <button @click="currentTab = 'users'" 
                    :class="currentTab === 'users' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa-solid fa-user mr-2'></i>Пользователи
            </button>
            <button @click="currentTab = 'settings'"
                    :class="currentTab === 'settings' ? 'bg-gray-800' : 'hover:bg-gray-800'"
                    class="px-4 py-2 rounded-lg transition-colors">
              <i class='fa-solid fa-gear mr-2'></i>Настройки
            </button>
            <router-link to="/admin/accounting"
                    class="px-4 py-2 rounded-lg transition-colors"
                    :class="currentTab === 'accounting' ? 'bg-gray-800' : 'hover:bg-gray-800'">
              <i class='fa-solid fa-calculator mr-2'></i>Бухгалтерия
            </router-link>
            <a href="/" class="px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400">
              <i class='fa fa-external-link mr-2'></i>На сайт
            </a>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Dashboard -->
        <div v-if="currentTab === 'dashboard'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Заказов сегодня</p>
                  <p class="text-3xl font-bold text-gray-900">{{ stats.todayOrders }}</p>
                </div>
                <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <i class='fa-solid fa-box text-primary-600 text-3xl'></i>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Выручка сегодня</p>
                  <p class="text-3xl font-bold text-gray-900">{{ formatMoney(stats.todayRevenue) }}</p>
                </div>
                <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <i class='fa fa-dollar text-green-600 text-3xl'></i>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Ожидают обработки</p>
                  <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingOrders }}</p>
                </div>
                <div class="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <i class='fa-regular fa-clock text-yellow-600 text-3xl'></i>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Активных товаров</p>
                  <p class="text-3xl font-bold text-gray-900">{{ stats.activeProducts }}</p>
                </div>
                <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i class='fa fa-box text-blue-600 text-3xl'></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="bg-white rounded-xl shadow-md">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold">Последние заказы</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№ заказа</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="order in recentOrders" :key="order.id"
                      class="hover:bg-gray-50 cursor-pointer"
                      @click="viewOrder(order.id)">
                    <td class="px-6 py-4 font-medium">{{ getField(order, 'orderNumber', 'order_number') }}</td>
                    <td class="px-6 py-4">{{ getField(order, 'customerName', 'customer_name') || getField(order, 'guestName', 'guest_name') }}</td>
                    <td class="px-6 py-4">{{ getField(order, 'customerPhone', 'customer_phone') || getField(order, 'guestPhone', 'guest_phone') }}</td>
                    <td class="px-6 py-4 font-bold text-primary-600">{{ formatMoney(getField(order, 'finalAmount', 'final_amount')) }}</td>
                    <td class="px-6 py-4"><OrderStatusBadge :status="order.status" /></td>
                    <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(getField(order, 'createdAt', 'created_at')) }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-if="!recentOrders.length" class="text-center py-8 text-gray-500">Заказов нет</p>
            </div>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="currentTab === 'orders'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b flex flex-wrap gap-4 justify-between items-center">
            <div class="flex flex-wrap gap-4 flex-1">
              <input 
                v-model="orderSearchQuery" 
                type="text" 
                placeholder="Поиск по номеру, имени, телефону..." 
                class="input-field w-64"
                @keyup.enter="loadOrders"
              >
              <select v-model="orderStatusFilter" @change="loadOrders" class="input-field w-auto">
                <option value="">Все статусы</option>
                <option value="pending">Ожидают</option>
                <option value="confirmed">Подтверждены</option>
                <option value="preparing">Готовятся</option>
                <option value="ready">Готовы</option>
                <option value="delivering">Доставляются</option>
                <option value="delivered">Доставлены</option>
                <option value="cancelled">Отменены</option>
              </select>
            </div>
            <div class="flex gap-3">
              <button @click="loadOrders" class="btn-primary">
                <i class='fa-solid fa-magnifying-glass mr-2'></i>Найти
              </button>
              <button @click="showOrderForm = true; editingOrder = null" class="btn-primary">
                <i class='fa-solid fa-plus mr-2'></i>Создать заказ
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№ заказа</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">
                    <div class="flex items-center gap-2">
                      <span>{{ getField(order, 'orderNumber', 'order_number') }}</span>
                      <i v-if="order.hasDelivery" class='fa fa-car text-blue-600' title="Доставка"></i>
                      <i v-else class='fa fa-store text-green-600' title="Самовывоз"></i>
                    </div>
                  </td>
                  <td class="px-6 py-4">{{ getField(order, 'customerName', 'customer_name') || getField(order, 'guestName', 'guest_name') }}</td>
                  <td class="px-6 py-4">{{ getField(order, 'customerPhone', 'customer_phone') || getField(order, 'guestPhone', 'guest_phone') }}</td>
                  <td class="px-6 py-4 font-bold text-primary-600">{{ formatMoney(getField(order, 'finalAmount', 'final_amount')) }}</td>
                  <td class="px-6 py-4">
                    <select v-model="order.status" @change="updateOrderStatus(order)"
                            class="text-sm border rounded-lg px-2 py-1 bg-white">
                      <option value="pending">Ожидает</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="preparing">Готовится</option>
                      <option value="ready">Готов</option>
                      <option value="delivering">Доставляется</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(getField(order, 'createdAt', 'created_at')) }}</td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button @click="viewOrderDetails(order)" class="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Просмотр">
                        <i class='fa-solid fa-eye text-xl'></i>
                      </button>
                      <button @click="editOrder(order)" class="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600" title="Редактировать">
                        <i class='fa-solid fa-pen text-xl'></i>
                      </button>
                      <button @click="deleteOrder(order)" class="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Удалить">
                        <i class='fa-solid fa-trash text-xl'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!orders.length" class="text-center py-8 text-gray-500">Заказов нет</p>
          </div>
        </div>

        <!-- Products Tab -->
        <div v-if="currentTab === 'products'" class="space-y-6">
          <div class="flex flex-wrap gap-4 justify-between items-center">
            <div class="flex flex-wrap gap-4 flex-1">
              <input 
                v-model="productSearchQuery" 
                type="text" 
                placeholder="Поиск товаров..." 
                class="input-field w-64"
                @keyup.enter="loadProducts"
              >
              <select v-model="productCategoryFilter" @change="loadProducts" class="input-field w-auto">
                <option value="">Все категории</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <p v-if="categories.length === 0" class="text-sm text-gray-500">
                <i class='fa-solid fa-spinner fa-spin mr-1'></i>
                Загрузка категорий...
              </p>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="productPopularFilter" @change="loadProducts" class="rounded">
                <span>Популярные</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="productNewFilter" @change="loadProducts" class="rounded">
                <span>Новинки</span>
              </label>
            </div>
            <button @click="showProductForm = true; editingProduct = null" class="btn-primary">
              <i class='fa-solid fa-plus mr-2'></i>Добавить товар
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="product in products" :key="product.id" 
                 class="bg-white rounded-xl shadow-md overflow-hidden">
              <div class="aspect-square bg-gray-100">
                <img :src="product.image || '/placeholder.jpg'" :alt="product.name"
                     class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="font-semibold mb-2 line-clamp-2">{{ product.name }}</h3>
                <p class="text-primary-600 font-bold mb-2">{{ formatMoney(getField(product, 'price', 'price')) }}</p>
                <div class="flex gap-2">
                  <button @click="editProduct(product)" class="flex-1 btn-secondary text-sm py-2">
                    <i class='fa-solid fa-pen mr-1'></i>Ред.
                  </button>
                  <button @click="deleteProduct(product.id)"
                          class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                    <i class='fa-solid fa-trash'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Tab -->
        <div v-if="currentTab === 'categories'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Категории</h2>
            <button @click="showCategoryForm = true; editingCategory = null" class="btn-primary">
              <i class='fa-solid fa-plus mr-2'></i>Добавить категорию
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cat in categories" :key="cat.id" 
                 class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <i :class="`fa ${cat.icon || 'fa-box'} text-2xl text-primary-600`"></i>
                  </div>
                  <div>
                    <h3 class="font-bold">{{ cat.name }}</h3>
                    <p class="text-sm text-gray-500">{{ cat.product_count || 0 }} товаров</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="editCategory(cat)" class="p-2 hover:bg-gray-100 rounded-lg">
                    <i class='fa-solid fa-pen text-gray-600'></i>
                  </button>
                  <button @click="deleteCategory(cat.id)" class="p-2 hover:bg-red-100 rounded-lg">
                    <i class='fa-solid fa-trash text-red-600'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="currentTab === 'users'" class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold">Пользователи</h2>
            <button @click="showUserForm = true" class="btn-primary">
              <i class='fa-solid fa-user-plus mr-2'></i>Добавить
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">{{ user.first_name }} {{ user.last_name }}</td>
                  <td class="px-6 py-4">{{ user.email }}</td>
                  <td class="px-6 py-4">
                    <select v-model="user.role" @change="updateUser(user)"
                            class="text-sm border rounded-lg px-2 py-1 bg-white">
                      <option value="customer">Клиент</option>
                      <option value="moderator">Модератор</option>
                      <option value="bartender">Бармен</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="user.is_active ? 'badge-success' : 'badge bg-gray-300'" class="badge">
                      {{ user.is_active ? 'Активен' : 'Деактивирован' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button @click="toggleUserStatus(user)" 
                            class="p-2 hover:bg-gray-100 rounded-lg"
                            :title="user.is_active ? 'Деактивировать' : 'Активировать'">
                      <i :class="user.is_active ? 'fa-solid fa-user-minus text-red-600' : 'fa-solid fa-user-plus text-green-600'"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="currentTab === 'settings'" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold mb-6">Настройки</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4">Доставка</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Стоимость доставки (₽)</label>
                  <input v-model="settings.deliveryFee" type="number" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Бесплатно от суммы (₽)</label>
                  <input v-model="settings.freeDeliveryFrom" type="number" class="input-field">
                </div>
              </div>
            </div>
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">Режим работы</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Открытие</label>
                  <input v-model="settings.openTime" type="time" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Закрытие</label>
                  <input v-model="settings.closeTime" type="time" class="input-field">
                </div>
              </div>
            </div>
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">Прием заказов</h3>
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="settings.acceptOrders" class="w-5 h-5 rounded">
                <span class="font-medium">Принимать новые заказы</span>
              </label>
            </div>
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">Способы оплаты</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.paymentCash" class="w-5 h-5 rounded">
                  <span>Наличными</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.paymentCard" class="w-5 h-5 rounded">
                  <span>Картой при получении</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="settings.paymentOnline" class="w-5 h-5 rounded">
                  <span>Онлайн</span>
                </label>
              </div>
            </div>
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">Контактная информация</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input v-model="settings.contactPhone" type="tel" class="input-field" placeholder="+7 (___) ___-__-__">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input v-model="settings.contactEmail" type="email" class="input-field" placeholder="info@ordershop.ru">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Город</label>
                  <input v-model="settings.contactCity" type="text" class="input-field" placeholder="Москва">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                  <input v-model="settings.contactAddress" type="text" class="input-field" placeholder="ул. Примерная, 1">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea v-model="settings.contactDescription" rows="3" class="input-field" placeholder="Краткое описание"></textarea>
                </div>
              </div>
            </div>
            <div class="border-t pt-6">
              <button @click="saveSettings" class="btn-primary">
                <i class='fa-solid fa-check mr-2'></i>Сохранить настройки
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Плавающий индикатор новых заказов (левый нижний угол) -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <div v-if="newOrders.length > 0" 
           class="fixed bottom-6 left-6 z-40 flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl shadow-2xl animate-pulse cursor-pointer hover:bg-red-700 transition-colors"
           @click="clearNewOrders">
        <i class='fa-solid fa-bell text-white animate-bell text-xl'></i>
        <div class="flex flex-col">
          <span class="text-xs text-red-200">Новые заказы</span>
          <span class="font-bold text-base">{{ newOrders.length }} {{ newOrders.length === 1 ? 'заказ' : (newOrders.length < 5 ? 'заказа' : 'заказов') }}</span>
        </div>
        <button @click.stop="clearNewOrders" class="ml-2 hover:bg-red-500 rounded-full p-1 transition-colors">
          <i class='fa-solid fa-xmark text-white'></i>
        </button>
      </div>
    </transition>

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 class="text-xl font-bold mb-4">{{ editingProduct ? 'Редактировать товар' : 'Новый товар' }}</h3>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input v-model="productForm.name" type="text" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea v-model="productForm.description" rows="3" class="input-field"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
              <select v-model="productForm.category_id" required class="input-field">
                <option value="">Выберите</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Цена (₽) *</label>
              <input v-model.number="productForm.price" type="number" step="0.01" required class="input-field">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">URL изображения</label>
            <input v-model="productForm.image" type="text" class="input-field" placeholder="/images/product.jpg">
          </div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="productForm.is_popular">
              <span>Популярное</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="productForm.is_new">
              <span>Новинка</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="productForm.is_active" checked>
              <span>Активен</span>
            </label>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary flex-1">Сохранить</button>
            <button type="button" @click="showProductForm = false" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div v-if="showCategoryForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">{{ editingCategory ? 'Редактировать категорию' : 'Новая категория' }}</h3>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input v-model="categoryForm.name" type="text" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input v-model="categoryForm.slug" type="text" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
            <input v-model="categoryForm.icon" type="text" class="input-field" placeholder="bx-cheese">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary flex-1">Сохранить</button>
            <button type="button" @click="showCategoryForm = false" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Form Modal -->
    <div v-if="showUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Новый пользователь</h3>
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
              <input v-model="userForm.firstName" type="text" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
              <input v-model="userForm.lastName" type="text" required class="input-field">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input v-model="userForm.email" type="email" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
            <input v-model="userForm.password" type="password" required class="input-field" minlength="6">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Роль *</label>
            <select v-model="userForm.role" required class="input-field">
              <option value="customer">Клиент</option>
              <option value="moderator">Модератор</option>
              <option value="bartender">Бармен</option>
              <option value="admin">Админ</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary flex-1">Создать</button>
            <button type="button" @click="showUserForm = false" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Order Form Modal (Create/Edit) -->
    <div v-if="showOrderForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
        <h3 class="text-xl font-bold mb-4">{{ editingOrder ? 'Редактировать заказ' : 'Создать заказ' }}</h3>
        <form @submit.prevent="saveOrder" class="space-y-6">
          <!-- Customer Info -->
          <div>
            <h4 class="font-bold mb-3">Информация о клиенте</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                <input v-model="orderForm.guestName" type="text" required class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                <input v-model="orderForm.guestPhone" type="tel" required class="input-field" placeholder="+7 (___) ___-__-__">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input v-model="orderForm.guestEmail" type="email" class="input-field">
              </div>
            </div>
          </div>

          <!-- Products -->
          <div>
            <h4 class="font-bold mb-3">Товары</h4>
            <div class="space-y-3">
              <div v-for="(item, index) in orderForm.items" :key="index" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <select v-model="item.productId" class="input-field flex-1" required>
                  <option value="">Выберите товар</option>
                  <option v-for="product in allProducts" :key="product.id" :value="product.id">
                    {{ product.name }} - {{ formatMoney(product.price) }}
                  </option>
                </select>
                <input v-model.number="item.quantity" type="number" min="1" max="99" class="input-field w-20" placeholder="Кол-во">
                <button type="button" @click="removeOrderItem(index)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <i class='fa-solid fa-trash'></i>
                </button>
              </div>
              <button type="button" @click="addOrderItem" class="btn-secondary w-full">
                <i class='fa-solid fa-plus mr-2'></i>Добавить товар
              </button>
            </div>
          </div>

          <!-- Delivery & Payment -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Тип доставки</label>
              <select v-model="orderForm.deliveryType" class="input-field">
                <option value="1">Самовывоз (бесплатно)</option>
                <option value="2">Курьером ({{ settings.deliveryFee }} ₽)</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Бесплатно от {{ settings.freeDeliveryFrom }} ₽</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select v-model="orderForm.status" class="input-field">
                <option value="pending">Ожидает</option>
                <option value="confirmed">Подтвержден</option>
                <option value="preparing">Готовится</option>
                <option value="ready">Готов</option>
                <option value="delivering">Доставляется</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
          </div>
          
          <!-- Delivery Address -->
          <div v-if="orderForm.deliveryType === '2'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-bold mb-3 text-blue-800">Адрес доставки</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Полный адрес *</label>
                <input v-model="orderForm.deliveryAddress.fullAddress" type="text" class="input-field" placeholder="Город, улица, дом, квартира">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input v-model="orderForm.deliveryAddress.city" type="text" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Улица</label>
                <input v-model="orderForm.deliveryAddress.street" type="text" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Дом</label>
                <input v-model="orderForm.deliveryAddress.building" type="text" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Квартира</label>
                <input v-model="orderForm.deliveryAddress.apartment" type="text" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Этаж</label>
                <input v-model="orderForm.deliveryAddress.floor" type="text" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Подъезд</label>
                <input v-model="orderForm.deliveryAddress.entrance" type="text" class="input-field">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Инструкция для курьера</label>
                <textarea v-model="orderForm.deliveryAddress.deliveryInstructions" rows="2" class="input-field"></textarea>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Способ оплаты</label>
              <select v-model="orderForm.paymentMethod" class="input-field">
                <option value="cash">Наличными</option>
                <option value="card">Картой</option>
                <option value="online">Онлайн</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
              <input v-model="orderForm.notes" type="text" class="input-field">
            </div>
          </div>

          <!-- Total -->
          <div class="bg-gray-100 p-4 rounded-lg">
            <div class="flex justify-between items-center text-lg font-bold">
              <span>Итого:</span>
              <span class="text-primary-600">{{ formatMoney(orderTotal) }}</span>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t">
            <button type="submit" class="btn-primary flex-1">Сохранить</button>
            <button type="button" @click="showOrderForm = false" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Заказ {{ selectedOrder?.orderNumber }}</h3>
          <button @click="showOrderDetails = false" class="p-2 hover:bg-gray-100 rounded-lg">
            <i class='fa fa-x text-xl'></i>
          </button>
        </div>
        
        <div v-if="selectedOrder" class="space-y-4">
          <div class="flex items-center gap-3">
            <OrderStatusBadge :status="selectedOrder.status" />
            <span class="text-sm text-gray-500">{{ formatDate(selectedOrder.createdAt) }}</span>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Клиент</p>
              <p class="font-medium">{{ selectedOrder.customerName || selectedOrder.guestName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Телефон</p>
              <p class="font-medium">{{ selectedOrder.customerPhone || selectedOrder.guestPhone }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">{{ selectedOrder.customerEmail || selectedOrder.guestEmail || '—' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Оплата</p>
              <p class="font-medium">{{ selectedOrder.paymentMethod === 'cash' ? 'Наличными' : selectedOrder.paymentMethod === 'card' ? 'Картой' : 'Онлайн' }}</p>
            </div>
          </div>
          
          <!-- Доставка -->
          <div v-if="selectedOrder.hasDelivery" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <i class='fa fa-car text-blue-600 text-xl'></i>
              <h4 class="font-bold text-blue-800">Доставка</h4>
              <span class="badge badge-info">{{ selectedOrder.deliveryType }}</span>
            </div>
            <div class="space-y-2 text-sm">
              <p v-if="selectedOrder.deliveryAddress" class="text-gray-700">
                <span class="font-medium">Адрес:</span> {{ selectedOrder.deliveryAddress }}
              </p>
              <div v-if="selectedOrder.deliveryCity || selectedOrder.deliveryStreet" class="text-gray-600">
                <span v-if="selectedOrder.deliveryCity">{{ selectedOrder.deliveryCity }}, </span>
                <span v-if="selectedOrder.deliveryStreet">{{ selectedOrder.deliveryStreet }}</span>
                <span v-if="selectedOrder.deliveryBuilding">, д. {{ selectedOrder.deliveryBuilding }}</span>
                <span v-if="selectedOrder.deliveryApartment">, кв. {{ selectedOrder.deliveryApartment }}</span>
              </div>
              <div v-if="selectedOrder.deliveryFloor || selectedOrder.deliveryEntrance" class="text-gray-600">
                <span v-if="selectedOrder.deliveryEntrance">Подъезд: {{ selectedOrder.deliveryEntrance }}</span>
                <span v-if="selectedOrder.deliveryFloor">, Этаж: {{ selectedOrder.deliveryFloor }}</span>
              </div>
              <p v-if="selectedOrder.deliveryInstructions" class="text-gray-600">
                <span class="font-medium">Инструкция:</span> {{ selectedOrder.deliveryInstructions }}
              </p>
            </div>
          </div>
          <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <i class='fa fa-store text-green-600 text-xl'></i>
              <h4 class="font-bold text-green-800">Самовывоз</h4>
            </div>
            <p class="text-sm text-green-700 mt-2">Клиент заберет заказ самостоятельно</p>
          </div>
          
          <div>
            <h4 class="font-bold mb-2">Товары ({{ selectedOrder.items?.length || 0 }})</h4>
            <div v-if="selectedOrder.items && selectedOrder.items.length" class="space-y-2">
              <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between py-2 border-b">
                <div>
                  <span class="font-medium">{{ item.quantity }} x {{ item.name }}</span>
                  <p class="text-sm text-gray-500">{{ formatMoney(item.price) }} за ед.</p>
                </div>
                <span class="font-medium">{{ formatMoney(item.total) }}</span>
              </div>
            </div>
            <p v-else class="text-gray-500 text-sm">Товары не добавлены</p>
          </div>
          
          <div class="bg-gray-100 p-4 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span>Товары</span>
              <span>{{ formatMoney(selectedOrder.totalAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Доставка</span>
              <span>{{ formatMoney(selectedOrder.deliveryFee) }}</span>
            </div>
            <div v-if="selectedOrder.discountAmount > 0" class="flex justify-between text-green-600">
              <span>Скидка</span>
              <span>-{{ formatMoney(selectedOrder.discountAmount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Итого</span>
              <span class="text-primary-600">{{ formatMoney(selectedOrder.finalAmount) }}</span>
            </div>
          </div>
          
          <div v-if="selectedOrder.notes" class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600"><span class="font-medium">Комментарий:</span> {{ selectedOrder.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';
import OrderStatusBadge from '@/components/OrderStatusBadge.vue';
import { useSoundNotification } from '@/composables/useSoundNotification';
import { useOrderMonitoring } from '@/composables/useOrderMonitoring';

const router = useRouter();
const authStore = useAuthStore();

// Звуковые уведомления
const { soundEnabled, isInitialized, initAudio, testSound, notifyNewOrder } = useSoundNotification();

// Мониторинг заказов
const { newOrders, isMonitoring, startMonitoring, stopMonitoring, clearNewOrders } = useOrderMonitoring();

const currentTab = ref('dashboard');
const stats = ref({ todayOrders: 0, todayRevenue: 0, pendingOrders: 0, activeProducts: 0 });
const recentOrders = ref<any[]>([]);
const orders = ref<any[]>([]);
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const users = ref<any[]>([]);
const orderStatusFilter = ref('');
const orderSearchQuery = ref('');

// Products filters
const productSearchQuery = ref('');
const productCategoryFilter = ref('');
const productPopularFilter = ref(false);
const productNewFilter = ref(false);
const refreshing = ref(false);

// Авто-обновление каждые 5 секунд для заказов, каждые 30 секунд для остального
let ordersInterval: ReturnType<typeof setInterval> | null = null;
let dashboardInterval: ReturnType<typeof setInterval> | null = null;

// Settings
const settings = ref({
  deliveryFee: 299,
  freeDeliveryFrom: 1500,
  openTime: '10:00',
  closeTime: '23:00',
  acceptOrders: true,
  paymentCash: true,
  paymentCard: true,
  paymentOnline: false,
  contactPhone: '+7 (999) 000-00-00',
  contactEmail: 'info@ordershop.ru',
  contactCity: 'Москва',
  contactAddress: 'Москва, ул. Примерная, 1',
  contactDescription: 'Вкусная еда с доставкой до двери'
});

// Forms
const showProductForm = ref(false);
const showCategoryForm = ref(false);
const showUserForm = ref(false);
const editingProduct = ref<any>(null);
const editingCategory = ref<any>(null);

const productForm = ref({ name: '', description: '', category_id: '', price: 0, image: '', is_popular: false, is_new: false, is_active: true });
const categoryForm = ref({ name: '', slug: '', icon: '' });
const userForm = ref({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'customer' as string });

const formatMoney = (value: any): string => {
  if (value === null || value === undefined) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

const formatDate = (dateString: any): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// Универсальная функция для получения поля (snake_case или camelCase)
const getField = (obj: any, camel: string, snake: string): any => {
  if (!obj) return null;
  // Проверяем camelCase
  if (obj[camel] !== undefined) return obj[camel];
  // Проверяем snake_case
  if (obj[snake] !== undefined) return obj[snake];
  // Для вложенных объектов с точкой
  if (camel.includes('.')) {
    const [parent, child] = camel.split('.');
    if (obj[parent] && obj[parent][child] !== undefined) return obj[parent][child];
  }
  if (snake.includes('.')) {
    const [parent, child] = snake.split('.');
    if (obj[parent] && obj[parent][child] !== undefined) return obj[parent][child];
  }
  return null;
};

const loadDashboard = async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/orders?limit=10&sortBy=created_at&sortOrder=DESC')
    ]);
    stats.value = statsRes.data;
    recentOrders.value = ordersRes.data.orders || [];
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
};

const loadOrders = async () => {
  try {
    const params: any = { limit: 50 };
    if (orderStatusFilter.value) params.status = orderStatusFilter.value;
    if (orderSearchQuery.value) params.search = orderSearchQuery.value;
    
    const response = await api.get('/orders', { params });
    orders.value = response.data.orders || [];
  } catch (error) {
    console.error('Error loading orders:', error);
  }
};

const loadProducts = async () => {
  try {
    const params: any = { limit: 100, showInactive: 'true' }; // Показываем все товары включая неактивные
    if (productSearchQuery.value) params.search = productSearchQuery.value;
    if (productCategoryFilter.value) params.category = productCategoryFilter.value;
    if (productPopularFilter.value) params.popular = 'true';
    if (productNewFilter.value) params.new = 'true';
    
    const response = await api.get('/products', { params });
    products.value = response.data.products || [];
    console.log('Products loaded:', products.value.length);
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

const loadCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const loadUsers = async () => {
  try {
    const response = await api.get('/users?limit=100');
    users.value = response.data.users || [];
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const loadAllProducts = async () => {
  try {
    const response = await api.get('/products?limit=200');
    allProducts.value = response.data.products || [];
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Order management
const showOrderForm = ref(false);
const showOrderDetails = ref(false);
const editingOrder = ref<any>(null);
const selectedOrder = ref<any>(null);
const allProducts = ref<any[]>([]);
const orderForm = ref({
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  deliveryType: '1', // 1 = pickup, 2 = courier
  deliveryAddress: {
    fullAddress: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    floor: '',
    entrance: '',
    intercom: '',
    deliveryInstructions: ''
  },
  status: 'pending',
  paymentMethod: 'cash',
  notes: '',
  items: [{ productId: '', quantity: 1 }] as any[]
});

const orderTotal = computed(() => {
  const itemsTotal = orderForm.value.items.reduce((sum, item) => {
    const product = allProducts.value.find(p => p.id === item.productId);
    if (product) {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      return sum + (price * item.quantity);
    }
    return sum;
  }, 0);
  
  // Рассчитываем доставку
  let deliveryFee = 0;
  if (orderForm.value.deliveryType === '2') {
    deliveryFee = itemsTotal >= settings.value.freeDeliveryFrom ? 0 : settings.value.deliveryFee;
  }
  
  return itemsTotal + deliveryFee;
});

const addOrderItem = () => {
  orderForm.value.items.push({ productId: '', quantity: 1 });
};

const removeOrderItem = (index: number) => {
  if (orderForm.value.items.length > 1) {
    orderForm.value.items.splice(index, 1);
  }
};

const viewOrderDetails = (order: any) => {
  selectedOrder.value = order;
  showOrderDetails.value = true;
};

const editOrder = async (order: any) => {
  editingOrder.value = order;
  
  // Загружаем товары если еще не загружены
  if (allProducts.value.length === 0) {
    await loadAllProducts();
  }
  
  // Получаем items заказа
  const orderItems = order.items || [];
  
  // Определяем тип доставки
  const deliveryType = order.hasDelivery ? '2' : '1';
  
  orderForm.value = {
    guestName: order.customerName || order.guestName || '',
    guestPhone: order.customerPhone || order.guestPhone || '',
    guestEmail: order.customerEmail || order.guestEmail || '',
    deliveryType: deliveryType,
    deliveryAddress: {
      fullAddress: order.deliveryAddress || '',
      city: order.deliveryCity || '',
      street: order.deliveryStreet || '',
      building: order.deliveryBuilding || '',
      apartment: order.deliveryApartment || '',
      floor: order.deliveryFloor || '',
      entrance: order.deliveryEntrance || '',
      intercom: '',
      deliveryInstructions: order.deliveryInstructions || ''
    },
    status: order.status,
    paymentMethod: order.paymentMethod || 'cash',
    notes: order.notes || '',
    items: orderItems.length > 0 
      ? orderItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      : [{ productId: '', quantity: 1 }]
  };
  
  showOrderForm.value = true;
};

const deleteOrder = async (order: any) => {
  const orderNumber = getField(order, 'orderNumber', 'order_number') || order.id;
  if (!confirm(`Удалить заказ ${orderNumber}?`)) return;
  try {
    await api.delete(`/orders/${order.id}`);
    loadOrders();
    loadDashboard();
  } catch (error) {
    console.error('Error deleting order:', error);
  }
};

const saveOrder = async () => {
  try {
    const items = orderForm.value.items
      .filter(item => item.productId && item.quantity > 0)
      .map(item => {
        const product = allProducts.value.find(p => p.id === item.productId);
        const price = typeof product?.price === 'string' ? parseFloat(product.price) : (product?.price || 0);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: price,
          total: price * item.quantity
        };
      });

    const orderData: any = {
      guestName: orderForm.value.guestName,
      guestPhone: orderForm.value.guestPhone,
      guestEmail: orderForm.value.guestEmail || undefined,
      deliveryType: parseInt(orderForm.value.deliveryType),
      status: orderForm.value.status,
      paymentMethod: orderForm.value.paymentMethod,
      notes: orderForm.value.notes,
      items: items
    };

    // Добавляем адрес доставки если выбран курьер
    if (orderForm.value.deliveryType === '2') {
      orderData.deliveryAddress = {
        fullAddress: orderForm.value.deliveryAddress.fullAddress,
        city: orderForm.value.deliveryAddress.city,
        street: orderForm.value.deliveryAddress.street,
        building: orderForm.value.deliveryAddress.building,
        apartment: orderForm.value.deliveryAddress.apartment,
        floor: orderForm.value.deliveryAddress.floor,
        entrance: orderForm.value.deliveryAddress.entrance,
        intercom: orderForm.value.deliveryAddress.intercom,
        deliveryInstructions: orderForm.value.deliveryAddress.deliveryInstructions
      };
    }
    
    if (editingOrder.value) {
      // Update existing order
      await api.put(`/orders/${editingOrder.value.id}`, orderData);
    } else {
      // Create new order
      await api.post('/orders', orderData);
    }
    
    showOrderForm.value = false;
    editingOrder.value = null;
    orderForm.value = {
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      deliveryType: '1',
      deliveryAddress: {
        fullAddress: '',
        city: '',
        street: '',
        building: '',
        apartment: '',
        floor: '',
        entrance: '',
        intercom: '',
        deliveryInstructions: ''
      },
      status: 'pending',
      paymentMethod: 'cash',
      notes: '',
      items: [{ productId: '', quantity: 1 }]
    };
    loadOrders();
    loadDashboard();
  } catch (error: any) {
    console.error('Error saving order:', error);
    alert(error.response?.data?.error || 'Ошибка при сохранении заказа');
  }
};

const viewOrder = (id: number) => {
  router.push(`/admin/orders/${id}`);
};

const updateOrderStatus = async (order: any) => {
  try {
    await api.put(`/orders/${order.id}/status`, { status: order.status });
  } catch (error) {
    console.error('Error updating status:', error);
    loadOrders();
  }
};

const editProduct = (product: any) => {
  editingProduct.value = product;
  productForm.value = {
    name: product.name,
    description: product.description || '',
    category_id: product.category_id || product.categoryId || '',
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    image: product.image || '',
    is_popular: product.is_popular || product.isPopular || false,
    is_new: product.is_new || product.isNew || false,
    is_active: product.is_active !== undefined ? product.is_active : (product.isActive !== undefined ? product.isActive : true)
  };
  showProductForm.value = true;
};

const saveProduct = async () => {
  try {
    // Валидация
    if (!productForm.value.name || !productForm.value.category_id || !productForm.value.price) {
      alert('Заполните обязательные поля: название, категория, цена');
      return;
    }
    
    const slug = productForm.value.name.toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const payload = {
      name: productForm.value.name,
      slug: slug,
      description: productForm.value.description || null,
      price: Number(productForm.value.price),
      category_id: Number(productForm.value.category_id),
      image: productForm.value.image || null,
      is_popular: Boolean(productForm.value.is_popular),
      is_new: Boolean(productForm.value.is_new),
      is_active: Boolean(productForm.value.is_active)
    };
    
    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    showProductForm.value = false;
    loadProducts();
  } catch (error: any) {
    console.error('Error saving product:', error);
    alert(error.response?.data?.error || 'Ошибка при сохранении');
  }
};

const deleteProduct = async (id: number) => {
  if (!confirm('Удалить товар?')) return;
  try {
    await api.delete(`/products/${id}`);
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

const editCategory = (cat: any) => {
  editingCategory.value = cat;
  categoryForm.value = { name: cat.name, slug: cat.slug, icon: cat.icon || '' };
  showCategoryForm.value = true;
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, categoryForm.value);
    } else {
      await api.post('/categories', categoryForm.value);
    }
    showCategoryForm.value = false;
    loadCategories();
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('Удалить категорию?')) return;
  try {
    await api.delete(`/categories/${id}`);
    loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

const updateUser = async (user: any) => {
  try {
    await api.put(`/users/${user.id}`, {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active
    });
  } catch (error) {
    console.error('Error updating user:', error);
    loadUsers();
  }
};

const toggleUserStatus = async (user: any) => {
  if (!confirm(`${user.is_active ? 'Деактивировать' : 'Активировать'}?`)) return;
  try {
    await api.put(`/users/${user.id}`, {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: !user.is_active
    });
    loadUsers();
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

const createUser = async () => {
  try {
    await api.post('/users', userForm.value);
    showUserForm.value = false;
    userForm.value = { email: '', password: '', firstName: '', lastName: '', phone: '', role: 'customer' };
    loadUsers();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Ошибка');
  }
};

const saveSettings = async () => {
  try {
    await api.put('/settings', {
      delivery_fee: settings.value.deliveryFee,
      free_delivery_from: settings.value.freeDeliveryFrom,
      open_time: settings.value.openTime,
      close_time: settings.value.closeTime,
      accept_orders: settings.value.acceptOrders,
      payment_cash: settings.value.paymentCash,
      payment_card: settings.value.paymentCard,
      payment_online: settings.value.paymentOnline,
      contact_phone: settings.value.contactPhone,
      contact_email: settings.value.contactEmail,
      contact_city: settings.value.contactCity,
      contact_address: settings.value.contactAddress,
      contact_description: settings.value.contactDescription
    });
    alert('Настройки сохранены!');
    loadSettings();
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Ошибка при сохранении настроек');
  }
};

const loadSettings = async () => {
  try {
    const response = await api.get('/settings');
    const s = response.data;
    settings.value = {
      deliveryFee: s.delivery_fee || 299,
      freeDeliveryFrom: s.free_delivery_from || 1500,
      openTime: s.open_time || '10:00',
      closeTime: s.close_time || '23:00',
      acceptOrders: s.accept_orders !== false,
      paymentCash: s.payment_cash !== false,
      paymentCard: s.payment_card !== false,
      paymentOnline: s.payment_online || false,
      contactPhone: s.contact_phone || '+7 (999) 000-00-00',
      contactEmail: s.contact_email || 'info@ordershop.ru',
      contactCity: s.contact_city || 'Москва',
      contactAddress: s.contact_address || 'Москва, ул. Примерная, 1',
      contactDescription: s.contact_description || 'Вкусная еда с доставкой до двери'
    };
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

// Watch tab changes
watch(currentTab, (tab) => {
  if (tab === 'orders') loadOrders();
  if (tab === 'products') {
    loadProducts();
    // Загружаем категории если еще не загружены
    if (categories.value.length === 0) {
      loadCategories();
    }
  }
  if (tab === 'categories') loadCategories();
  if (tab === 'users') loadUsers();
  if (tab === 'settings') loadSettings();
});

// Watch для новых заказов - воспроизводим звук для каждого нового заказа
watch(newOrders, (newOrdersList) => {
  if (newOrdersList && newOrdersList.length > 0) {
    console.log('[AdminPanel] New orders detected:', newOrdersList.length);
    // Воспроизводим звук для каждого нового заказа
    newOrdersList.forEach(order => {
      notifyNewOrder(order);
    });
  }
}, { deep: true });

// Функции управления звуком
function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
  localStorage.setItem('adminSoundEnabled', String(soundEnabled.value));
}

function handleTestSound() {
  initAudio();
  testSound();
}

// Загрузка сохраненной настройки звука
function loadSoundPreference() {
  const saved = localStorage.getItem('adminSoundEnabled');
  if (saved !== null) {
    soundEnabled.value = saved === 'true';
  }
}

onMounted(() => {
  loadDashboard();
  loadSettings();
  loadAllProducts(); // Загружаем товары для формы заказа
  loadCategories(); // Загружаем категории для фильтров
  loadSoundPreference(); // Загружаем настройку звука

  // Запускаем мониторинг новых заказов
  startMonitoring();

  // Авто-обновление заказов каждые 5 секунд
  ordersInterval = setInterval(() => {
    if (currentTab.value === 'orders') {
      loadOrders();
    }
    loadDashboard(); // Обновляем статистику
  }, 5000);
  
  // Авто-обновление остальных данных каждые 30 секунд
  dashboardInterval = setInterval(() => {
    if (currentTab.value === 'products') loadProducts();
    if (currentTab.value === 'categories') loadCategories();
    if (currentTab.value === 'users') loadUsers();
  }, 30000);
});

onUnmounted(() => {
  if (ordersInterval) {
    clearInterval(ordersInterval);
  }
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
  // Останавливаем мониторинг новых заказов
  stopMonitoring();
});
</script>

<style scoped>
/* Анимация колокольчика при новом заказе */
@keyframes bell-ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
  20%, 40%, 60%, 80% { transform: rotate(10deg); }
}

.animate-bell {
  animation: bell-ring 1s ease-in-out infinite;
}
</style>
