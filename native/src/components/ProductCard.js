import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../services/api';

export default function ProductCard({ product, onPress, onAddCart }) {
  const isOutOfStock = product.stock <= 0;
  // Resolve o caminho da imagem relativo do backend para URL absoluta
  const imageUrl = product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{isOutOfStock ? 'ESGOTADO' : product.discount || 'OFERTA'}</Text>
      </View>
      
      <Image source={{ uri: imageUrl }} style={[styles.image, isOutOfStock && { opacity: 0.5 }]} resizeMode="contain" />
      
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      
      <View style={styles.priceContainer}>
        {!!product.oldPrice && <Text style={styles.oldPrice}>{product.oldPrice}</Text>}
        <Text style={styles.price}>{product.price}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.btn, isOutOfStock && styles.btnDisabled]} 
        onPress={onAddCart} 
        disabled={isOutOfStock}
      >
        <MaterialCommunityIcons name="cart-outline" size={16} color="#FFF" />
        <Text style={styles.btnText}>{isOutOfStock ? 'Sem Estoque' : 'Adicionar'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4EEEE',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D93D7B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  image: { width: '100%', height: 120, marginBottom: 8 },
  brand: { fontSize: 10, color: '#0A8399', fontWeight: 'bold', textTransform: 'uppercase' },
  name: { fontSize: 13, fontWeight: 'bold', color: '#0E3D55', marginVertical: 4, minHeight: 36 },
  priceContainer: { marginTop: 'auto', marginBottom: 12 },
  oldPrice: { fontSize: 11, color: '#6C788A', textDecorationLine: 'line-through' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#26B394' },
  btn: { backgroundColor: '#26B394', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 4 },
  btnDisabled: { backgroundColor: '#c5d8da' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});
