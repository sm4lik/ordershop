import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/api';

/**
 * Composable для мониторинга новых заказов в реальном времени
 * Работает через polling (опрос сервера)
 */
export function useOrderMonitoring() {
  const newOrders = ref<any[]>([]);
  const previousOrderIds = ref<Set<number>>(new Set());
  const isMonitoring = ref(false);
  const pollingInterval = ref<number | null>(null);
  const checkInterval = 5000; // Проверка каждые 5 секунд

  /**
   * Получение текущего списка заказов
   */
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders', {
        params: { limit: 50, sortBy: 'created_at', sortOrder: 'DESC' }
      });
      const orders = response.data.orders || [];
      
      // Получаем только ID заказов
      const currentOrderIds = new Set(orders.map((o: any) => o.id));
      
      // Если это первая загрузка - просто сохраняем ID
      if (previousOrderIds.value.size === 0) {
        previousOrderIds.value = currentOrderIds;
        return [];
      }
      
      // Ищем новые заказы (тех, которых не было в предыдущем списке)
      const newOrderList = orders.filter((order: any) => 
        !previousOrderIds.value.has(order.id)
      );
      
      // Обновляем предыдущие ID
      previousOrderIds.value = currentOrderIds;
      
      return newOrderList;
    } catch (error) {
      console.error('[OrderMonitoring] Error fetching orders:', error);
      return [];
    }
  };

  /**
   * Запуск мониторинга
   */
  const startMonitoring = () => {
    if (isMonitoring.value) return;
    
    console.log('[OrderMonitoring] Starting monitoring...');
    isMonitoring.value = true;
    
    // Первая проверка
    fetchOrders();
    
    // Регулярные проверки
    pollingInterval.value = window.setInterval(async () => {
      const newOrderList = await fetchOrders();
      
      if (newOrderList.length > 0) {
        console.log('[OrderMonitoring] New orders detected:', newOrderList.length);
        newOrders.value = newOrderList;
      }
    }, checkInterval);
  };

  /**
   * Остановка мониторинга
   */
  const stopMonitoring = () => {
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
    isMonitoring.value = false;
    console.log('[OrderMonitoring] Stopped monitoring');
  };

  /**
   * Сброс списка новых заказов
   */
  const clearNewOrders = () => {
    newOrders.value = [];
  };

  /**
   * Получение количества новых заказов
   */
  const getNewOrdersCount = () => {
    return newOrders.value.length;
  };

  // Автозапуск при монтировании
  onMounted(() => {
    startMonitoring();
  });

  // Остановка при размонтировании
  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    newOrders,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearNewOrders,
    getNewOrdersCount,
    fetchOrders
  };
}
