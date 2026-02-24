<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-3xl font-bold mb-6">Контакты</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 class="text-xl font-bold mb-4">Свяжитесь с нами</h2>
            
            <div class="space-y-4">
              <div v-if="settings.contactPhone" class="flex items-start gap-3">
                <i class='fa-solid fa-phone text-2xl text-primary-600 mt-1'></i>
                <div>
                  <p class="font-medium">Телефон</p>
                  <a :href="`tel:${settings.contactPhone}`" class="text-primary-600 hover:underline">
                    {{ settings.contactPhone }}
                  </a>
                </div>
              </div>
              
              <div v-if="settings.contactEmail" class="flex items-start gap-3">
                <i class='fa-solid fa-envelope text-2xl text-primary-600 mt-1'></i>
                <div>
                  <p class="font-medium">Email</p>
                  <a :href="`mailto:${settings.contactEmail}`" class="text-primary-600 hover:underline">
                    {{ settings.contactEmail }}
                  </a>
                </div>
              </div>
              
              <div v-if="settings.contactAddress || settings.contactCity" class="flex items-start gap-3">
                <i class='fa-solid fa-location-dot text-2xl text-primary-600 mt-1'></i>
                <div>
                  <p class="font-medium">Адрес</p>
                  <p class="text-gray-600">
                    <span v-if="settings.contactCity">{{ settings.contactCity }}, </span>
                    {{ settings.contactAddress }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <i class='fa fa-clock text-2xl text-primary-600 mt-1'></i>
                <div>
                  <p class="font-medium">Режим работы</p>
                  <p class="text-gray-600">Ежедневно с {{ settings.openTime }} до {{ settings.closeTime }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 class="text-xl font-bold mb-4">Мы на карте</h2>
            <div class="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <p class="text-gray-500">Карта</p>
            </div>
          </div>
        </div>
        
        <div v-if="settings.contactDescription" class="border-t mt-8 pt-8">
          <h2 class="text-xl font-bold mb-4">О компании</h2>
          <p class="text-gray-600">{{ settings.contactDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

const settings = ref({
  contactPhone: '+7 (999) 000-00-00',
  contactEmail: 'info@ordershop.ru',
  contactCity: 'Москва',
  contactAddress: 'Москва, ул. Примерная, 1',
  contactDescription: 'Вкусная еда с доставкой до двери. Быстро, качественно, надежно.',
  openTime: '10:00',
  closeTime: '23:00'
});

const loadSettings = async () => {
  try {
    const response = await api.get('/settings');
    const s = response.data;
    settings.value = {
      contactPhone: s.contact_phone || '+7 (999) 000-00-00',
      contactEmail: s.contact_email || 'info@ordershop.ru',
      contactCity: s.contact_city || 'Москва',
      contactAddress: s.contact_address || 'Москва, ул. Примерная, 1',
      contactDescription: s.contact_description || 'Вкусная еда с доставкой до двери',
      openTime: s.open_time || '10:00',
      closeTime: s.close_time || '23:00'
    };
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

onMounted(() => {
  loadSettings();
});
</script>
