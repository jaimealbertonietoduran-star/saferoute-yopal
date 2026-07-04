import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { usePuntosCriticos } from './hooks/usePuntosCriticos';
import { useZonasRiesgo } from './hooks/useZonasRiesgo';
import { useGPSTracking } from './hooks/useGPSTracking';
import { pedirPermisosNotificaciones } from './notifications/alertaVial';
import Emergencias from './components/Emergencias';

let MapView, Circle;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Circle = Maps.Circle;
}

export default function App() {
  const [mostrarEmergencias, setMostrarEmergencias] = useState(false);
  const { puntos, cargando, error, getPuntosCercanos } = usePuntosCriticos();
  const { verificarZonas } = useZonasRiesgo(getPuntosCercanos);
  const { location, enBackground, permisoDenegado, errorGPS, reintentarPermiso } = useGPSTracking(verificarZonas);

  React.useEffect(() => {
    pedirPermisosNotificaciones().catch(() => {});
  }, []);

  const handleReintentar = async () => {
    const ok = await reintentarPermiso();
    if (!ok) {
      Alert.alert('Permiso denegado', 'Activa el permiso de ubicación desde Ajustes para usar SafeRoute.');
    }
  };

  if (permisoDenegado) {
    return (
      <View style={styles.loading}>
        <Text style={styles.textLoading}>📍 Permiso de ubicación requerido</Text>
        <Text style={styles.textSub}>SafeRoute necesita GPS para funcionar.</Text>
        <TouchableOpacity style={styles.btnReintentar} onPress={handleReintentar}>
          <Text style={styles.txtBtnReintentar}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      {Platform.OS === 'web' ? (
        <View style={styles.loading}>
          <Text style={styles.textLoading}>Mapa no disponible en web</Text>
        </View>
      ) : location ? (
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

      {errorGPS && (
        <View style={styles.badgeError}>
          <Text style={styles.txtBadge}>{errorGPS}</Text>
        </View>
      )}

      {enBackground && (
        <View style={styles.badgeBateria}>
          <Text style={styles.txtBadge}>🔋 Modo ahorro activo</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMostrarEmergencias(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTexto}>🆘</Text>
      </TouchableOpacity>

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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  textLoading: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  textSub: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
  btnReintentar: { marginTop: 20, backgroundColor: '#cc0000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  txtBtnReintentar: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
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
  badgeError: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(204,0,0,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '85%',
  },
  txtBadge: { color: '#fff', fontSize: 12 },
});