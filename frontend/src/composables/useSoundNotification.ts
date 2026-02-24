import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable для управления звуковыми уведомлениями
 * Использует внешний звуковой файл из public/sounds
 */
export function useSoundNotification() {
  const soundEnabled = ref(true);
  const audioRef = ref<HTMLAudioElement | null>(null);
  const isInitialized = ref(false);

  /**
   * Инициализация аудио (должна вызываться после взаимодействия с пользователем)
   */
  const initAudio = () => {
    if (isInitialized.value) return;
    
    if (!audioRef.value) {
      audioRef.value = new Audio('/sounds/turning-on-a-working-pager.mp3');
      audioRef.value.preload = 'auto';
      audioRef.value.volume = 0.5;
      isInitialized.value = true;
      console.log('[SoundNotification] Audio initialized with external file');
    }
  };

  /**
   * Воспроизведение звука
   */
  const playSound = async () => {
    console.log('[SoundNotification] playSound called, enabled:', soundEnabled.value, 'hasAudio:', !!audioRef.value);
    
    if (!soundEnabled.value) {
      console.log('[SoundNotification] Sound is disabled');
      return;
    }
    
    if (!audioRef.value) {
      console.log('[SoundNotification] Audio not initialized, trying to init...');
      initAudio();
      if (!audioRef.value) {
        console.log('[SoundNotification] Failed to create Audio element');
        return;
      }
    }

    try {
      // Сбрасываем время воспроизведения и играем
      audioRef.value.currentTime = 0;
      const playPromise = audioRef.value.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[SoundNotification] Sound playing successfully');
          })
          .catch((error) => {
            console.error('[SoundNotification] Playback error:', error);
          });
      }
    } catch (error) {
      console.error('[SoundNotification] Error playing sound:', error);
    }
  };

  /**
   * Показ браузерного уведомления
   */
  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true
      });
    }
  };

  /**
   * Запрос разрешения на браузерные уведомления
   */
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  /**
   * Тестовое воспроизведение звука (для проверки пользователем)
   */
  const testSound = () => {
    console.log('[SoundNotification] Testing sound...');
    initAudio();
    playSound();
  };

  /**
   * Воспроизведение звука при новом заказе
   */
  const notifyNewOrder = (order: any) => {
    console.log('[SoundNotification] notifyNewOrder called:', order);
    playSound();
    const orderNumber = order.orderNumber || order.order_number || '#' + order.id;
    showBrowserNotification(
      '🔔 Новый заказ!',
      `Заказ ${orderNumber} ожидает обработки`
    );
  };

  // Инициализация при монтировании
  onMounted(() => {
    requestNotificationPermission();
  });

  // Очистка
  onUnmounted(() => {
    if (audioRef.value) {
      audioRef.value.pause();
      audioRef.value = null;
    }
  });

  return {
    soundEnabled,
    isInitialized,
    initAudio,
    playSound,
    testSound,
    notifyNewOrder,
    requestNotificationPermission
  };
}
