<template>
  <span :class="badgeClass">
    <i :class="statusIcon" class="mr-1"></i>
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OrderStatus } from '@/types';

const props = defineProps<{
  status: OrderStatus;
}>();

const statusConfig: Record<OrderStatus, { text: string; class: string; icon: string }> = {
  pending: { text: 'Ожидает', class: 'badge-warning', icon: 'fa-regular fa-clock' },
  confirmed: { text: 'Подтвержден', class: 'badge-info', icon: 'fa-solid fa-circle-check' },
  preparing: { text: 'Готовится', class: 'badge-info', icon: 'fa-solid fa-mug-hot' },
  ready: { text: 'Готов', class: 'badge-success', icon: 'fa-solid fa-check-double' },
  delivering: { text: 'Доставляется', class: 'badge-info', icon: 'fa-solid fa-car' },
  delivered: { text: 'Доставлен', class: 'badge-success', icon: 'fa-solid fa-box' },
  cancelled: { text: 'Отменен', class: 'badge bg-gray-500 text-white', icon: 'fa-solid fa-circle-xmark' }
};

const badgeClass = computed(() => `badge ${statusConfig[props.status].class}`);
const statusText = computed(() => statusConfig[props.status].text);
const statusIcon = computed(() => statusConfig[props.status].icon);
</script>
