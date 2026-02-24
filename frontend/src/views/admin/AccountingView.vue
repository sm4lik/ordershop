<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/admin" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Админ-панель</span>
          </router-link>
          <h1 class="text-xl font-bold">Бухгалтерия</h1>
          <div></div>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Общий доход</p>
                <p class="text-3xl font-bold text-green-600">{{ formatMoney(stats.totalIncome) }}</p>
              </div>
              <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <i class='fa-solid fa-arrow-trend-up text-green-600 text-3xl'></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Общий расход</p>
                <p class="text-3xl font-bold text-red-600">{{ formatMoney(stats.totalExpense) }}</p>
              </div>
              <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <i class='fa-solid fa-arrow-trend-down text-red-600 text-3xl'></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Прибыль</p>
                <p :class="stats.profit >= 0 ? 'text-blue-600' : 'text-orange-600'" class="text-3xl font-bold">
                  {{ formatMoney(stats.profit) }}
                </p>
              </div>
              <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i :class="stats.profit >= 0 ? 'fa-solid fa-coins' : 'fa-solid fa-triangle-exclamation'" class="text-blue-600 text-3xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Всего транзакций</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalTransactions }}</p>
              </div>
              <div class="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <i class='fa-solid fa-receipt text-gray-600 text-3xl'></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Export -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
          <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div class="flex flex-wrap gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Дата от</label>
                <input v-model="filters.dateFrom" type="date" class="input-field w-auto">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Дата до</label>
                <input v-model="filters.dateTo" type="date" class="input-field w-auto">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                <select v-model="filters.type" class="input-field w-auto">
                  <option value="">Все</option>
                  <option value="income">Доходы</option>
                  <option value="expense">Расходы</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select v-model="filters.category_id" class="input-field w-auto">
                  <option value="">Все</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="loadTransactions" class="btn-primary">
                <i class='fa-solid fa-magnifying-glass mr-2'></i>Применить
              </button>
              <button @click="exportToExcel" class="btn-secondary bg-green-50 text-green-600 hover:bg-green-100">
                <i class='fa-solid fa-file-excel mr-2'></i>Excel
              </button>
              <button @click="exportToCSV" class="btn-secondary bg-blue-50 text-blue-600 hover:bg-blue-100">
                <i class='fa-solid fa-file-csv mr-2'></i>CSV
              </button>
              <button @click="exportPeriodReport" class="btn-secondary bg-purple-50 text-purple-600 hover:bg-purple-100">
                <i class='fa-solid fa-chart-line mr-2'></i>Периоды
              </button>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Создал</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="t in transactions" :key="t.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(t.transactionDate) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ t.type === 'income' ? 'Доход' : 'Расход' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <i :class="`fa ${t.category.icon} text-${t.category.color}-600`"></i>
                      <span>{{ t.category.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-bold" :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'">
                    {{ formatMoney(t.amount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{{ t.description || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span v-if="t.orderNumber" class="text-primary-600">{{ t.orderNumber }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ t.creatorName || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex gap-2">
                      <button @click="editTransaction(t)" class="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600" title="Редактировать">
                        <i class='fa-solid fa-pen'></i>
                      </button>
                      <button v-if="!t.orderId" @click="deleteTransaction(t.id)" class="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Удалить">
                        <i class='fa-solid fa-trash'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!transactions.length" class="text-center py-8 text-gray-500">Транзакций нет</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
            <button @click="pagination.page--" :disabled="pagination.page === 1"
                    class="px-4 py-2 rounded-lg border disabled:opacity-50">
              <i class='fa-solid fa-chevron-left'></i>
            </button>
            <span class="px-4 py-2">Стр. {{ pagination.page }} из {{ pagination.pages }}</span>
            <button @click="pagination.page++" :disabled="pagination.page === pagination.pages"
                    class="px-4 py-2 rounded-lg border disabled:opacity-50">
              <i class='fa-solid fa-chevron-right'></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Transaction Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">{{ editing ? 'Редактировать транзакцию' : 'Новая транзакция' }}</h3>
        <form @submit.prevent="saveTransaction" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Тип *</label>
            <select v-model="form.type" required class="input-field">
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
            <select v-model="form.category_id" required class="input-field">
              <option value="">Выберите категорию</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Сумма (₽) *</label>
            <input v-model.number="form.amount" type="number" step="0.01" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Дата</label>
            <input v-model="form.transaction_date" type="datetime-local" class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea v-model="form.description" rows="3" class="input-field"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Способ оплаты</label>
            <select v-model="form.payment_method" class="input-field">
              <option value="">Не указано</option>
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="online">Онлайн</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary flex-1">Сохранить</button>
            <button type="button" @click="showForm = false" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add transaction button -->
    <div class="fixed bottom-6 right-6 z-30">
      <button @click="addTransaction" 
              class="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-colors"
              title="Добавить транзакцию">
        <i class='fa-solid fa-plus text-2xl'></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api';

const transactions = ref<any[]>([]);
const categories = ref<any[]>([]);
const stats = ref({
  totalIncome: 0,
  totalExpense: 0,
  profit: 0,
  totalTransactions: 0
});

const filters = ref({
  dateFrom: '',
  dateTo: '',
  type: '',
  category_id: ''
});

const pagination = ref({ page: 1, limit: 50, total: 0, pages: 1 });

const showForm = ref(false);
const editing = ref(false);
const editingTransaction = ref<any>(null);

const form = ref({
  type: 'income',
  category_id: '',
  amount: 0,
  description: '',
  payment_method: '',
  transaction_date: ''
});

const formatMoney = (amount: any) => {
  if (amount === undefined || amount === null) return '0.00 ₽';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return num.toFixed(2) + ' ₽';
};

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadTransactions = async () => {
  try {
    const params: any = { 
      page: pagination.value.page, 
      limit: pagination.value.limit,
      ...filters.value
    };
    
    const [transRes, statsRes, catRes] = await Promise.all([
      api.get('/transactions', { params }),
      api.get('/transactions/stats', { params: filters.value }),
      api.get('/transactions/categories')
    ]);
    
    transactions.value = transRes.data.transactions || [];
    pagination.value = transRes.data.pagination || {};
    stats.value = statsRes.data.summary || {};
    categories.value = catRes.data || [];
  } catch (error) {
    console.error('Error loading accounting data:', error);
  }
};

const exportToExcel = async () => {
  try {
    const params = new URLSearchParams({
      ...filters.value,
      token: localStorage.getItem('token') || ''
    });
    
    window.open(`${import.meta.env.VITE_API_URL}/reports/export/excel?${params}`, '_blank');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

const exportToCSV = async () => {
  try {
    const params = new URLSearchParams({
      ...filters.value,
      token: localStorage.getItem('token') || ''
    });
    
    window.open(`${import.meta.env.VITE_API_URL}/reports/export/csv?${params}`, '_blank');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

const exportPeriodReport = async () => {
  try {
    const params = new URLSearchParams({
      dateFrom: filters.value.dateFrom || '',
      dateTo: filters.value.dateTo || '',
      groupBy: 'day', // day, week, month, year
      token: localStorage.getItem('token') || ''
    });
    
    window.open(`${import.meta.env.VITE_API_URL}/reports/export/period?${params}`, '_blank');
  } catch (error) {
    console.error('Error exporting period report:', error);
  }
};

const addTransaction = () => {
  editing.value = false;
  editingTransaction.value = null;
  form.value = {
    type: 'income',
    category_id: '',
    amount: 0,
    description: '',
    payment_method: '',
    transaction_date: new Date().toISOString().slice(0, 16)
  };
  showForm.value = true;
};

const editTransaction = (t: any) => {
  editing.value = true;
  editingTransaction.value = t;
  form.value = {
    type: t.type,
    category_id: t.categoryId,
    amount: t.amount,
    description: t.description || '',
    payment_method: t.paymentMethod || '',
    transaction_date: t.transactionDate ? new Date(t.transactionDate).toISOString().slice(0, 16) : ''
  };
  showForm.value = true;
};

const saveTransaction = async () => {
  try {
    if (editing.value && editingTransaction.value) {
      await api.put(`/transactions/${editingTransaction.value.id}`, form.value);
    } else {
      await api.post('/transactions', form.value);
    }
    showForm.value = false;
    loadTransactions();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Ошибка сохранения');
  }
};

const deleteTransaction = async (id: number) => {
  if (!confirm('Удалить транзакцию?')) return;
  try {
    await api.delete(`/transactions/${id}`);
    loadTransactions();
  } catch (error) {
    console.error('Error deleting transaction:', error);
  }
};

onMounted(() => {
  loadTransactions();
});
</script>
