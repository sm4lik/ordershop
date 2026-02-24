<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <router-link to="/admin/products" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Назад к товарам</span>
          </router-link>
          <h1 class="text-xl font-bold">{{ isEdit ? 'Редактирование товара' : 'Новый товар' }}</h1>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <form @submit.prevent="saveProduct" class="bg-white rounded-xl shadow-md p-8 space-y-8">
          
          <!-- Основная информация -->
          <div class="border-b pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  class="input-field"
                  placeholder="Например: Филадельфия ролл"
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea 
                  v-model="form.description" 
                  rows="4" 
                  class="input-field"
                  placeholder="Подробное описание товара"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                <select v-model.number="form.category_id" required class="input-field">
                  <option value="" disabled>Выберите категорию</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Цена (₽) *</label>
                <input 
                  v-model.number="form.price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  class="input-field"
                  placeholder="0.00"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Старая цена (₽)</label>
                <input 
                  v-model.number="form.old_price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  class="input-field"
                  placeholder="0.00"
                >
                <p class="text-xs text-gray-500 mt-1">Для отображения скидки</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Артикул (SKU)</label>
                <input 
                  v-model="form.sku" 
                  type="text" 
                  class="input-field"
                  placeholder="SUSHI-001"
                >
              </div>
            </div>
          </div>

          <!-- Изображения -->
          <div class="border-b pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Изображения</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Основное изображение (URL)</label>
                <input 
                  v-model="form.image" 
                  type="text" 
                  class="input-field"
                  placeholder="https://example.com/image.jpg"
                >
                <div v-if="form.image" class="mt-2">
                  <img :src="form.image" alt="Preview" class="h-32 w-auto object-cover rounded-lg border">
                </div>
              </div>
            </div>
          </div>

          <!-- Характеристики -->
          <div class="border-b pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Характеристики</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Вес (г)</label>
                <input 
                  v-model.number="form.weight" 
                  type="number" 
                  min="0"
                  class="input-field"
                  placeholder="500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Объём (мл)</label>
                <input 
                  v-model.number="form.volume" 
                  type="number" 
                  min="0"
                  class="input-field"
                  placeholder="500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Алкоголь (%)</label>
                <input 
                  v-model.number="form.alcohol_percentage" 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="100"
                  class="input-field"
                  placeholder="5.0"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Остаток на складе</label>
                <input 
                  v-model.number="form.stock_quantity" 
                  type="number" 
                  min="0"
                  class="input-field"
                  placeholder="100"
                >
              </div>
            </div>
          </div>

          <!-- Состав и пищевая ценность -->
          <div class="border-b pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Состав и пищевая ценность</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Состав (ингредиенты)</label>
                <textarea 
                  v-model="form.ingredients_text" 
                  rows="3" 
                  class="input-field"
                  placeholder="Лосось, сливочный сыр, огурец, рис, нори"
                ></textarea>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Пищевая ценность</label>
                <textarea 
                  v-model="form.nutritional_info_text" 
                  rows="3" 
                  class="input-field"
                  placeholder="Белки: 10г, Жиры: 15г, Углеводы: 30г, Калории: 250 ккал"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Статусы -->
          <div class="border-b pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Статусы товара</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label class="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="is_active"
                  name="is_active"
                  v-model="form.is_active"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                >
                <div>
                  <span class="font-medium text-gray-900">Активен</span>
                  <p class="text-xs text-gray-500">Товар отображается на сайте</p>
                </div>
              </label>

              <label class="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="is_popular"
                  name="is_popular"
                  v-model="form.is_popular"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                >
                <div>
                  <span class="font-medium text-gray-900">Популярное</span>
                  <p class="text-xs text-gray-500">Показывать в блоке популярного</p>
                </div>
              </label>

              <label class="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="is_new"
                  name="is_new"
                  v-model="form.is_new"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                >
                <div>
                  <span class="font-medium text-gray-900">Новинка</span>
                  <p class="text-xs text-gray-500">Показывать в блоке новинок</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="flex gap-4 pt-4">
            <button 
              type="submit" 
              :disabled="saving" 
              class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="saving" class='fa-solid fa-spinner fa-spin mr-2'></i>
              <i v-else class='fa-solid fa-check mr-2'></i>
              {{ isEdit ? 'Сохранить изменения' : 'Создать товар' }}
            </button>
            <router-link 
              to="/admin/products" 
              class="btn-secondary flex-1 justify-center"
            >
              Отмена
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();

const categories = ref<any[]>([]);
const saving = ref(false);
const error = ref<string | null>(null);

const form = ref({
  name: '',
  slug: '',
  description: '',
  price: 0,
  old_price: null as number | null,
  category_id: '' as number | string,
  image: '',
  sku: '',
  weight: null as number | null,
  volume: null as number | null,
  alcohol_percentage: null as number | null,
  stock_quantity: 0,
  ingredients_text: '',
  nutritional_info_text: '',
  is_popular: false,
  is_new: false,
  is_active: true
});

const isEdit = computed(() => !!route.params.id);

const generateSlug = (name: string): string => {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  return name.split('')
    .map(char => translitMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const saveProduct = async () => {
  error.value = null;
  
  // Валидация
  if (!form.value.name || !form.value.category_id) {
    error.value = 'Заполните обязательные поля: название, цена, категория';
    alert(error.value);
    return;
  }
  
  if (form.value.price === undefined || form.value.price === null || form.value.price <= 0) {
    error.value = 'Цена должна быть больше 0';
    alert(error.value);
    return;
  }

  saving.value = true;
  try {
    // Генерация slug из name если не заполнен
    if (!form.value.slug && form.value.name) {
      form.value.slug = generateSlug(form.value.name);
    }

    // Преобразование типов данных с правильными именами полей (snake_case)
    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description || null,
      price: Number(form.value.price),
      old_price: form.value.old_price ? Number(form.value.old_price) : null,
      category_id: Number(form.value.category_id),
      image: form.value.image || null,
      sku: form.value.sku || null,
      weight: form.value.weight ? Number(form.value.weight) : null,
      volume: form.value.volume ? Number(form.value.volume) : null,
      alcohol_percentage: form.value.alcohol_percentage ? Number(form.value.alcohol_percentage) : null,
      stock_quantity: form.value.stock_quantity ? Number(form.value.stock_quantity) : 0,
      ingredients: form.value.ingredients_text ? form.value.ingredients_text.split(',').map(s => s.trim()) : null,
      nutritional_info: form.value.nutritional_info_text ? form.value.nutritional_info_text.split(',').map(s => s.trim()) : null,
      is_popular: Boolean(form.value.is_popular),
      is_new: Boolean(form.value.is_new),
      is_active: Boolean(form.value.is_active)
    };

    console.log('Saving product:', payload);

    if (isEdit.value) {
      await api.put(`/products/${route.params.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    
    router.push('/admin/products');
  } catch (err: any) {
    console.error('Error saving product:', err);
    const errorMsg = err.response?.data?.error || 'Ошибка при сохранении';
    error.value = errorMsg;
    alert(errorMsg);
  } finally {
    saving.value = false;
  }
};

const loadProduct = async () => {
  try {
    const response = await api.get(`/products/${route.params.id}`);
    const p = response.data;

    console.log('Loaded product:', p);

    // Преобразование JSON полей в текст для отображения
    let ingredientsText = '';
    if (p.ingredients) {
      ingredientsText = typeof p.ingredients === 'string' 
        ? p.ingredients 
        : Array.isArray(p.ingredients) 
          ? p.ingredients.join(', ') 
          : JSON.stringify(p.ingredients);
    }

    let nutritionalText = '';
    if (p.nutritional_info) {
      nutritionalText = typeof p.nutritional_info === 'string' 
        ? p.nutritional_info 
        : Array.isArray(p.nutritional_info) 
          ? p.nutritional_info.join(', ') 
          : JSON.stringify(p.nutritional_info);
    }

    form.value = {
      name: p.name,
      slug: p.slug || '',
      description: p.description || '',
      price: p.price,
      old_price: p.old_price || null,
      category_id: p.category_id,
      image: p.image || '',
      sku: p.sku || '',
      weight: p.weight || null,
      volume: p.volume || null,
      alcohol_percentage: p.alcohol_percentage || null,
      stock_quantity: p.stock_quantity || 0,
      ingredients_text: ingredientsText,
      nutritional_info_text: nutritionalText,
      is_popular: Boolean(p.is_popular),
      is_new: Boolean(p.is_new),
      is_active: Boolean(p.is_active)
    };

    console.log('Form populated:', form.value);
  } catch (err) {
    console.error('Error loading product:', err);
    alert('Ошибка загрузки товара');
  }
};

onMounted(async () => {
  try {
    // Загрузка категорий
    const catsRes = await api.get('/categories');
    categories.value = catsRes.data || [];
    console.log('Categories loaded:', categories.value.length);

    // Если редактируем - загружаем товар
    if (isEdit.value) {
      console.log('Loading product for edit, ID:', route.params.id);
      await loadProduct();
    }
  } catch (err) {
    console.error('Error loading data:', err);
    alert('Ошибка загрузки данных');
  }
});
</script>
