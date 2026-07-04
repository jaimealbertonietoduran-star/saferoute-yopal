import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Linking } from 'react-native';

const NUMEROS = [
  { id: '1', nombre: 'Línea de Emergencias', numero: '123', icono: '🆘', color: '#cc0000' },
  { id: '2', nombre: 'Policía Nacional', numero: '112', icono: '👮', color: '#003580' },
  { id: '3', nombre: 'Ambulancia / Cruz Roja', numero: '132', icono: '🚑', color: '#cc0000' },
  { id: '4', nombre: 'Bomberos', numero: '119', icono: '🚒', color: '#ff6600' },
  { id: '5', nombre: 'Hospital de Yopal', numero: '6086352121', icono: '🏥', color: '#006633' },
  { id: '6', nombre: 'Defensa Civil', numero: '144', icono: '🛡️', color: '#ff9900' },
  { id: '7', nombre: 'Tránsito Yopal', numero: '6086353030', icono: '🚦', color: '#666600' },
  { id: '8', nombre: 'ICBF', numero: '141', icono: '👶', color: '#0066cc' },
];

export default function Emergencias({ visible, onCerrar }) {
  const llamar = (numero) => Linking.openURL(`tel:${numero}`);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>🆘 Números de Emergencia</Text>
            <TouchableOpacity onPress={onCerrar} style={styles.btnCerrar}>
              <Text style={styles.txtCerrar}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitulo}>Yopal — Casanare</Text>
          <FlatList
            data={NUMEROS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderLeftColor: item.color }]}
                onPress={() => llamar(item.numero)}
                activeOpacity={0.7}
              >
                <Text style={styles.icono}>{item.icono}</Text>
                <View style={styles.info}>
                  <Text style={styles.nombreServicio}>{item.nombre}</Text>
                  <Text style={styles.numeroTel}>{item.numero}</Text>
                </View>
                <View style={[styles.btnLlamar, { backgroundColor: item.color }]}>
                  <Text style={styles.txtLlamar}>📞 Llamar</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#cc0000' },
  btnCerrar: { padding: 5 },
  txtCerrar: { fontSize: 18, color: '#666', fontWeight: 'bold' },
  subtitulo: { textAlign: 'center', color: '#666', fontSize: 13, marginVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 15, marginVertical: 5, backgroundColor: '#f9f9f9', borderRadius: 10, borderLeftWidth: 4 },
  icono: { fontSize: 28, marginRight: 12 },
  info: { flex: 1 },
  nombreServicio: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  numeroTel: { fontSize: 16, color: '#666', marginTop: 2 },
  btnLlamar: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  txtLlamar: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});