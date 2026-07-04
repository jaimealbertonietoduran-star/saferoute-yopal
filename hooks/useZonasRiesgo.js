import { useRef, useCallback } from 'react';
import { getNivelActual } from '../utils/nivelRiesgo';
import { dispararAlertaVial } from '../notifications/alertaVial';

export const useZonasRiesgo = (getPuntosCercanos) => {
  const alertaActivaRef = useRef(new Set());
  const ultimoCheckRef = useRef(0);

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
    const cercanos = getPuntosCercanos(userCoords.latitude, userCoords.longitude);

    cercanos.forEach(punto => {
      const distanciaMetros = calcularDistancia(
        userCoords.latitude, userCoords.longitude,
        punto.latitude, punto.longitude
      ) * 1000;

      if (distanciaMetros <= punto.radius) {
        dentroAhora.add(punto.id);
        if (!alertaActivaRef.current.has(punto.id)) {
          const { nivel, mensaje } = getNivelActual(punto);
          dispararAlertaVial(punto.nombre, nivel, mensaje).catch(() => {});
        }
      }
    });

    alertaActivaRef.current = dentroAhora;
  }, [calcularDistancia, getPuntosCercanos]);

  return { verificarZonas };
};