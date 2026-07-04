import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Alert, Vibration } from 'react-native';
import { getConfigNivel } from '../utils/nivelRiesgo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const pedirPermisosNotificaciones = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
};

export const dispararAlertaVial = async (nombreZona, nivel = 1, mensajePersonalizado = null) => {
  const config = getConfigNivel(nivel);
  const mensaje = mensajePersonalizado || config.mensajeDefault;

  // Vibración según nivel de peligro
  Vibration.vibrate(config.vibracion);

  // Haptic feedback adicional para niveles altos
  if (nivel === 3) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
  if (nivel === 4) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.titulo,
        body: `${nombreZona}\n${mensaje}`,
        sound: true,
        priority: nivel >= 3
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
        vibrate: config.vibracion,
      },
      trigger: null,
    });
  } catch (e) {
    // Fallback si Expo Go bloquea notificaciones
    Vibration.vibrate(config.vibracion);
    Alert.alert(config.titulo, `${nombreZona}\n${mensaje}`);
  }
};