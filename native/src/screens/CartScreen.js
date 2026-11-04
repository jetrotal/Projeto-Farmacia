import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { WEB_URL } from '../services/api';

export default function CartScreen({ navigation }) {
  const { cartItems, removeFromCart } = useCart();
  const subtotal = cartItems.reduce((acc, item) => acc + (item.priceValue * item.qty), 0);

  const handleCheckout = () => {
    Alert.alert('Funcionalidade', 'No momento, finalize a compra acessando nosso site!');
  };

  const renderItem = ({ item }) => {
    // Utilizando a WEB_URL
    const imageUrl = item.image.startsWith('http') ? item.image : `${WEB_URL}${item.image}`;
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        <View style={styles.info}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price}>{item.price} (x{item.qty})</Text>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.cartId)} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#D93D7B" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="cart-off" size={64} color="#D7E4E5" />
          <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Catálogo')}>
            <Text style={styles.btnText}>Explorar Produtos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.cartId}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValue}>R$ {subtotal.toFixed(2).replace('.', ',')}</Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleCheckout}>
              <Text style={styles.btnText}>Continuar</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F9' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#6C788A', marginVertical: 16 },
  cartItem: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  image: { width: 60, height: 60, marginRight: 12 },
  info: { flex: 1 },
  brand: { fontSize: 10, color: '#0A8399', fontWeight: 'bold' },
  name: { fontSize: 14, fontWeight: 'bold', color: '#0E3D55', marginVertical: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#26B394' },
  deleteBtn: { padding: 8 },
  footer: { backgroundColor: '#FFF', padding: 24, borderTopWidth: 1, borderTopColor: '#E4EEEE' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: '#6C788A' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#0E3D55' },
  btn: { backgroundColor: '#26B394', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
