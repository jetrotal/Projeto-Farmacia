import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para a Home para podermos abrir detalhes do produto
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false, headerTintColor: '#0E3D55' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}

// Stack para o Catálogo
function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false, headerTintColor: '#0E3D55' }}>
      <Stack.Screen name="CatalogMain" component={CatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0E3D55' },
        headerTintColor: '#FFF',
        tabBarActiveTintColor: '#26B394',
        tabBarInactiveTintColor: '#6C788A',
        tabBarStyle: { borderTopWidth: 0, elevation: 10, shadowOpacity: 0.1 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Início') iconName = 'home-outline';
          else if (route.name === 'Catálogo') iconName = 'store-search-outline';
          else if (route.name === 'Carrinho') iconName = 'cart-outline';
          else if (route.name === 'Perfil') iconName = 'account-outline';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Catálogo" component={CatalogStack} options={{ title: 'Produtos' }} />
      <Tab.Screen 
        name="Carrinho" 
        component={CartScreen} 
        options={{ tabBarBadge: cartCount > 0 ? cartCount : null }} 
      />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
