import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const usePuntosCriticos = () => {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'puntos_criticos'));
        const datos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPuntos(datos);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return { puntos, cargando, error };
};