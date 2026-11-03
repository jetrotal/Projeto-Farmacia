import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    ApiService.getFeaturedProducts()
      .then(data => setFeatured(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Banner Simplificado */}
      <View style={styles.hero}>
        <Text style={styles.heroBadge}>🏷️ BOASVINDAS10</Text>
        <Text style={styles.heroTitle}>Sua saúde em boas mãos</Text>
        <Text style={styles.heroSubtitle}>Medicamentos com entrega rápida.</Text>
      </View>

      {/* Destaques */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ofertas em Destaque</Text>
          <MaterialCommunityIcons name="star-four-points" size={20} color="#F5C330" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#26B394" />
        ) : (
          <FlatList
            data={featured}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: 180 }}>
                <ProductCard 
                  product={item} 
                  onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
                  onAddCart={() => addToCart(item, 1)}
                />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8F9' },
  hero: { backgroundColor: '#0E3D55', padding: 24, paddingVertical: 40, alignItems: 'center' },
  heroBadge: { backgroundColor: '#D93D7B', color: '#FFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { color: '#D7E4E5', fontSize: 14, textAlign: 'center' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0E3D55' },
});
