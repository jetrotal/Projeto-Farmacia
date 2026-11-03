import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';

export default function ProfileScreen() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('cliente@farmarcia.com.br'); // Facilita o teste
  const [password, setPassword] = useState('Cliente@2026');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      ApiService.getMyOrders().then(data => setOrders(Array.isArray(data) ? data : []));
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if(!email || !password) return Alert.alert('Erro', 'Preencha os campos.');
    const result = await login(email, password);
    if(!result.success) Alert.alert('Erro', result.message);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.containerLogin}>
        <MaterialCommunityIcons name="account-circle-outline" size={80} color="#0A8399" />
        <Text style={styles.title}>Acesse sua conta</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name[0]}</Text></View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={16} color="#D93D7B" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Pedidos ({orders.length})</Text>
        {orders.length === 0 ? (
          <Text style={{color: '#6C788A'}}>Nenhum pedido encontrado.</Text>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNum}>Pedido #{order.orderNumber}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderTotal}>Total: R$ {Number(order.totalValue).toFixed(2).replace('.',',')}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F9' },
  containerLogin: { flex: 1, backgroundColor: '#FFF', padding: 32, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0E3D55', marginTop: 16, marginBottom: 32 },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#0E3D55', marginBottom: 8 },
  input: { backgroundColor: '#F5F8F9', borderWidth: 1, borderColor: '#D7E4E5', padding: 16, borderRadius: 12, fontSize: 16 },
  btn: { backgroundColor: '#26B394', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  profileHeader: { backgroundColor: '#0E3D55', padding: 32, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  avatar: { width: 80, height: 80, backgroundColor: '#26B394', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  userEmail: { fontSize: 14, color: '#D7E4E5', marginTop: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
  logoutText: { color: '#D93D7B', fontWeight: 'bold' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0E3D55', marginBottom: 16 },
  orderCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E4EEEE' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderNum: { fontWeight: 'bold', color: '#0E3D55' },
  orderStatus: { color: '#0A8399', fontWeight: 'bold', fontSize: 12 },
  orderTotal: { color: '#26B394', fontWeight: 'bold' }
});
