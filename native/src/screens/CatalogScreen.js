import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ApiService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      ApiService.getCatalogProducts()
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#26B394" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              onAddCart={() => addToCart(item, 1)}
            />
          )}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F9' },
});
