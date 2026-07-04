import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('SafeRoute crash:', error, info);
  }

  reiniciar = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.titulo}>⚠️ Algo salió mal</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.btn} onPress={this.reiniciar}>
            <Text style={styles.txtBtn}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#cc0000', marginBottom: 10 },
  msg: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#cc0000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  txtBtn: { color: '#fff', fontWeight: 'bold' },
});