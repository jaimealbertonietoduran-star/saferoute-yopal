import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as Location from 'expo-location';

const GPS_FOREGROUND = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 8000,
  distanceInterval: 10,
  ...(Platform.OS === 'ios' && { activityType: Location.ActivityType.AutomotiveNavigation }),
};

const GPS_BACKGROUND = {
  accuracy: Location.Accuracy.Low,
  timeInterval: Platform.OS === 'android' ? 30000 : 45000,
  distanceInterval: Platform.OS === 'android' ? 50 : 80,
  ...(Platform.OS === 'ios' && { activityType: Location.ActivityType.AutomotiveNavigation }),
};

export const useGPSTracking = (onLocationUpdate) => {
  const [location, setLocation] = useState(null);
  const [enBackground, setEnBackground] = useState(false);
  const [permisoDenegado, setPermisoDenegado] = useState(false);
  const [errorGPS, setErrorGPS] = useState(null);

  const subscriptionRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const locationRef = useRef(null);
  const iniciarGPS = useCallback(async (config) => {
    try {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      subscriptionRef.current = await Location.watchPositionAsync(config, (newLocation) => {
        locationRef.current = newLocation.coords;
        setLocation(newLocation.coords);
        setErrorGPS(null);
        onLocationUpdate(newLocation.coords);
      });
      setErrorGPS(null);
    } catch (e) {
      setErrorGPS('No se pudo iniciar el GPS. Verifica que esté activado.');
    }
  }, [onLocationUpdate]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (permisoDenegado) {
        appStateRef.current = nextState;
        return;
      }
      try {
        if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
          setEnBackground(true);
          await iniciarGPS(GPS_BACKGROUND);
        } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
          setEnBackground(false);
          await iniciarGPS(GPS_FOREGROUND);
        }
      } catch (e) {
        setErrorGPS('Error al cambiar el modo de GPS.');
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [iniciarGPS, permisoDenegado]);

  useEffect(() => {
    const iniciar = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermisoDenegado(true);
          return;
        }
        await iniciarGPS(GPS_FOREGROUND);
      } catch (e) {
        setErrorGPS('No se pudo solicitar permisos de ubicación.');
      }
    };
    iniciar();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [iniciarGPS]);
useEffect(() => {
    const t = setTimeout(() => {
      if (!locationRef.current) {
        setErrorGPS('Señal GPS débil. Sal a un área abierta.');
      }
    }, 15000);
    return () => clearTimeout(t);
  }, []);
  const reintentarPermiso = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermisoDenegado(false);
        await iniciarGPS(GPS_FOREGROUND);
      }
      return status === 'granted';
    } catch (e) {
      return false;
    }
  };

  return { location, enBackground, permisoDenegado, errorGPS, reintentarPermiso };
};