import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);

  // LISTA DE PUNTOS CRÍTICOS (Ajustado según tu propuesta técnica)
  const puntosCriticos = [
    { 
      id: '1', 
      nombre: 'Intersección Calle 30 con Carrera 14', 
      latitude: 5.328262, 
      longitude: -72.398008, 
      radius: 100 
    },
    { 
      id: '2', 
      nombre: 'Punto de Prueba Proximidad', 
      latitude: 5.3484, // Cerca de Unisangil
      longitude: -72.3931, 
      radius: 20 
    },
    { 
      id: '3', 
      nombre: 'Área de Alto Flujo', 
      latitude: 5.3330, 
      longitude: -72.3940, 
      radius: 20 
    }
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos de GPS para SafeRoute.');
        return;
      }

      // RASTREO CONSTANTE: Ideal para cuando vas en la moto
      let sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Cada 5 segundos
          distanceInterval: 5, // O cada 5 metros
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          verificarZonas(newLocation.coords);
        }
      );
      return () => sub.remove();
    })();
  }, []);

  // LÓGICA PARA ESCANEAR TODOS LOS PUNTOS
  const verificarZonas = (userCoords) => {
    puntosCriticos.forEach(punto => {
      const distancia = calcularDistancia(
        userCoords.latitude, 
        userCoords.longitude, 
        punto.latitude, 
        punto.longitude
      );

      // Si entras en el radio de CUALQUIERA de los puntos
      if (distancia * 1000 <= punto.radius) {
        Alert.alert(
          "SISTEMA SAFEROUTE: ¡ALERTA!", 
          `Estás ingresando a: ${punto.nombre}. Zona de alta accidentalidad. Reduzca la velocidad.`
        );
      }
    });
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

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
          showsUserLocation={true}
        >
          {/* DIBUJAR TODOS LOS PUNTOS EN EL MAPA AUTOMÁTICAMENTE */}
          {puntosCriticos.map(punto => (
            <Circle
              key={punto.id}
              center={{ latitude: punto.latitude, longitude: punto.longitude }}
              radius={punto.radius}
              fillColor="rgba(255, 0, 0, 0.3)"
              strokeColor="red"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Text>Buscando señal de GPS en Yopal...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
