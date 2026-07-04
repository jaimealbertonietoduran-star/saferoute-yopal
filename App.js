import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Alert, AppState, TouchableOpacity } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { usePuntosCriticos } from './hooks/usePuntosCriticos';
import { pedirPermisosNotificaciones, dispararAlertaVial } from './notifications/alertaVial';
import { getNivelActual } from './utils/nivelRiesgo';
import Emergencias from './components/Emergencias';

// GPS en primer plano — precisión normal
const GPS_FOREGROUND = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 8000,
  distanceInterval: 10,
};

// GPS en segundo plano — ahorro de batería
const GPS_BACKGROUND = {
  accuracy: Location.Accuracy.Low,
  timeInterval: 30000,
  distanceInterval: 50,
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [mostrarEmergencias, setMostrarEmergencias] = useState(false);
  const [enBackground, setEnBackground] = useState(false);

  const subscriptionRef = useRef(null);
  const alertaActivaRef = useRef(new Set());
  const ultimoCheckRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const { puntos, cargando, error } = usePuntosCriticos();

  const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const verificarZonas = useCallback((userCoords) => {
    const ahora = Date.now();
    if (ahora - ultimoCheckRef.current < 8000) return;
    ultimoCheckRef.current = ahora;

    const dentroAhora = new Set();

    puntos.forEach(punto => {
      const distanciaMetros = calcularDistancia(
        userCoords.latitude, userCoords.longitude,
        punto.latitude, punto.longitude
      ) * 1000;

      if (distanciaMetros <= punto.radius) {
        dentroAhora.add(punto.id);
        if (!alertaActivaRef.current.has(punto.id)) {
          const { nivel, mensaje } = getNivelActual(punto);
          dispararAlertaVial(punto.nombre, nivel, mensaje);
        }
      }
    });

    alertaActivaRef.current = dentroAhora;
  }, [calcularDistancia, puntos]);

  // Función reutilizable para iniciar GPS con cualquier config
  const iniciarGPS = useCallback(async (config) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    subscriptionRef.current = await Location.watchPositionAsync(
      config,
      (newLocation) => {
        setLocation(newLocation.coords);
        verificarZonas(newLocation.coords);
      }
    );
  }, [verificarZonas]);

  // Optimizador de batería — detecta cuando la app va a segundo plano
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        setEnBackground(true);
        await iniciarGPS(GPS_BACKGROUND); // reduce frecuencia GPS
      } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        setEnBackground(false);
        await iniciarGPS(GPS_FOREGROUND); // restaura precisión normal
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [iniciarGPS]);

  // Inicio de la app
  useEffect(() => {
    const iniciar = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'SafeRoute necesita GPS para funcionar.');
        return;
      }
      await pedirPermisosNotificaciones();
      await iniciarGPS(GPS_FOREGROUND);
    };

    iniciar();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [iniciarGPS]);

  if (cargando) {
    return (
      <View style={styles.loading}>
        <Text style={styles.textLoading}>Cargando zonas de riesgo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.textLoading}>Error al cargar datos</Text>
        <Text style={styles.textSub}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          {puntos.map(punto => (
            <Circle
              key={punto.id}
              center={{ latitude: punto.latitude, longitude: punto.longitude }}
              radius={punto.radius}
              fillColor="rgba(255,0,0,0.25)"
              strokeColor="#cc0000"
              strokeWidth={2}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Text style={styles.textLoading}>Iniciando SafeRoute Yopal...</Text>
          <Text style={styles.textSub}>Esperando señal GPS</Text>
        </View>
      )}

      {/* Badge modo ahorro */}
      {enBackground && (
        <View style={styles.badgeBateria}>
          <Text style={styles.txtBadge}>🔋 Modo ahorro activo</Text>
        </View>
      )}

      {/* Botón flotante de emergencias */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMostrarEmergencias(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTexto}>🆘</Text>
      </TouchableOpacity>

      {/* Modal emergencias */}
      <Emergencias
        visible={mostrarEmergencias}
        onCerrar={() => setMostrarEmergencias(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  textLoading: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  textSub: { fontSize: 14, color: '#666', marginTop: 5 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#cc0000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabTexto: { fontSize: 28 },
  badgeBateria: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  txtBadge: { color: '#fff', fontSize: 12 },
});