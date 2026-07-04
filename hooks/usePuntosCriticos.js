import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const CELL_SIZE = 0.01; // ~1km

const cellKey = (lat, lon) => `${Math.floor(lat / CELL_SIZE)}:${Math.floor(lon / CELL_SIZE)}`;

export const usePuntosCriticos = () => {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'puntos_criticos'));
        const datos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (activo) setPuntos(datos);
      } catch (e) {
        if (activo) setError('No se pudieron cargar las zonas de riesgo. Revisa tu conexión.');
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, []);

  const grid = useMemo(() => {
    const g = new Map();
    puntos.forEach(p => {
      const key = cellKey(p.latitude, p.longitude);
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(p);
    });
    return g;
  }, [puntos]);

  const getPuntosCercanos = (lat, lon) => {
    const resultado = [];
    const latCell = Math.floor(lat / CELL_SIZE);
    const lonCell = Math.floor(lon / CELL_SIZE);
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLon = -1; dLon <= 1; dLon++) {
        const key = `${latCell + dLat}:${lonCell + dLon}`;
        if (grid.has(key)) resultado.push(...grid.get(key));
      }
    }
    return resultado;
  };

  return { puntos, cargando, error, getPuntosCercanos };
};