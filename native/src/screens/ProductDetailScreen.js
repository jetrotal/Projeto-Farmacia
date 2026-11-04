import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiService, WEB_URL } from '../services/api';
import { useCart } from '../contexts/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    ApiService.getProductById(id).then(setProduct).catch(() => navigation.goBack());
  }, [id]);

  if (!product) return <ActivityIndicator size="large" color="#26B394" style={{ marginTop: 50 }} />;

  const isOutOfStock = product.stock <= 0;
  // Utilizando a WEB_URL
  const imageUrl = product.image.startsWith('http') ? product.image : `${WEB_URL}${product.image}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(i => (
            <MaterialCommunityIcons key={i} name="star" size={16} color={i <= Math.round(product.rating||5) ? "#F5C330" : "#D7E4E5"} />
          ))}
          <Text style={styles.reviews}>({product.reviews} avaliações)</Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.priceBox}>
          {!!product.oldPrice && <Text style={styles.oldPrice}>De: {product.oldPrice}</Text>}
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.installment}>em até {product.installment}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.btn, isOutOfStock && { backgroundColor: '#c5d8da' }]} 
          disabled={isOutOfStock}
          onPress={() => addToCart(product, 1)}
        >
          <MaterialCommunityIcons name="cart-outline" size={20} color="#FFF" />
          <Text style={styles.btnText}>{isOutOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  imageContainer: { backgroundColor: '#F5F8F9', padding: 20, alignItems: 'center' },
  image: { width: 250, height: 250 },
  content: { padding: 24 },
  brand: { color: '#0A8399', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0E3D55', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  reviews: { color: '#6C788A', fontSize: 12, marginLeft: 8 },
  description: { fontSize: 14, color: '#6C788A', lineHeight: 22, marginBottom: 24 },
  priceBox: { marginBottom: 24 },
  oldPrice: { fontSize: 14, color: '#6C788A', textDecorationLine: 'line-through' },
  price: { fontSize: 32, fontWeight: 'bold', color: '#26B394' },
  installment: { fontSize: 12, color: '#6C788A' },
  btn: { backgroundColor: '#26B394', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
