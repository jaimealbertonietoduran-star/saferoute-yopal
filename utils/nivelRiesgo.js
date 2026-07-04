// utils/nivelRiesgo.js

export const getNivelActual = (punto) => {
  const horaActual = new Date().getHours();

  if (punto.horarios_riesgo && Array.isArray(punto.horarios_riesgo)) {
    const horarioActivo = punto.horarios_riesgo.find(
      h => horaActual >= h.hora_inicio && horaActual < h.hora_fin
    );
    if (horarioActivo) return { nivel: horarioActivo.nivel, mensaje: horarioActivo.mensaje };
  }

  return { nivel: punto.nivel_base || 1, mensaje: null };
};

export const getConfigNivel = (nivel) => {
  const configs = {
    1: {
      titulo: '📗 SafeRoute — Precaución',
      mensajeDefault: 'Zona con historial de accidentes. Conduzca con atención.',
      vibracion: [200],
      prioridad: 'default',
      etiqueta: 'BAJO'
    },
    2: {
      titulo: '📙 SafeRoute — Riesgo Moderado',
      mensajeDefault: 'Zona con accidentes frecuentes. Reduzca la velocidad.',
      vibracion: [200, 100, 200],
      prioridad: 'high',
      etiqueta: 'MEDIO'
    },
    3: {
      titulo: '📕 SafeRoute — ¡Alto Riesgo!',
      mensajeDefault: '¡Atención! Zona de alta accidentalidad. Extreme precauciones.',
      vibracion: [300, 100, 300, 100, 300],
      prioridad: 'max',
      etiqueta: 'ALTO'
    },
    4: {
      titulo: '🚨 SafeRoute — ¡ZONA CRÍTICA!',
      mensajeDefault: '¡PELIGRO! Alta frecuencia de accidentes graves en este horario. ¡Máxima precaución!',
      vibracion: [500, 100, 500, 100, 500, 100, 500],
      prioridad: 'max',
      etiqueta: 'CRÍTICO'
    }
  };
  return configs[nivel] || configs[1];
};