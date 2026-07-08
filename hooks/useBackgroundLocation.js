import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const TASK_NAME = 'saferoute-background-location';
let onUpdateCallback = null;

TaskManager.defineTask(TASK_NAME, ({ data, error }) => {
  if (error || !data) return;
  const coords = data.locations?.[0]?.coords;
  if (coords && onUpdateCallback) onUpdateCallback(coords);
});

export const useBackgroundLocation = (onLocationUpdate) => {
  const activo = useRef(false);

  useEffect(() => {
    onUpdateCallback = onLocationUpdate;
    return () => { onUpdateCallback = null; };
  }, [onLocationUpdate]);

  const iniciar = async () => {
    if (activo.current) return true;
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') return false;

    const yaCorriendo = await Location.hasStartedLocationUpdatesAsync(TASK_NAME).catch(() => false);
    if (!yaCorriendo) {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 50,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'SafeRoute Yopal',
          notificationBody: 'Monitoreando zonas de riesgo en segundo plano',
          notificationColor: '#cc0000',
        },
      });
    }
    activo.current = true;
    return true;
  };

  const detener = async () => {
    const yaCorriendo = await Location.hasStartedLocationUpdatesAsync(TASK_NAME).catch(() => false);
    if (yaCorriendo) await Location.stopLocationUpdatesAsync(TASK_NAME);
    activo.current = false;
  };

  return { iniciar, detener };
};