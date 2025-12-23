import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // <-- Thêm thư viện này
import { ActivityIndicator, View, Text } from 'react-native';
import { DeviceEventEmitter } from 'react-native';

// Import Navigators & Screens
import AuthStack from './src/navigation/AuthStack';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import CreateRouteScreen from './src/screens/CreateRouteScreen'; // <-- Import màn hình Tạo
import RouteDetailScreen from './src/screens/RouteDetailScreen'; // <-- Import màn hình Chi tiết

const Stack = createNativeStackNavigator(); // <-- Tạo Stack

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userToken').then(t => {
      setToken(t);
      setLoading(false);
    });

    // 2. Lắng nghe sự kiện "Hết hạn phiên" từ HomeScreen (hoặc bất cứ đâu)
    const subscription = DeviceEventEmitter.addListener('AUTH_EXPIRED', () => {
      setToken(null); // <-- Set null để App tự chuyển về màn hình Đăng nhập ngay lập tức
      AsyncStorage.removeItem('userToken'); // Xóa chắc chắn lần nữa
    });

    // Dọn dẹp
    return () => {
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? (
          // --- KHI ĐÃ ĐĂNG NHẬP: Dùng Stack bao quanh Tab ---
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* 1. Màn hình chính là bộ Tab (Home, Profile) */}
            <Stack.Screen name="MainTab">
              {(props) => (
                <MainTabNavigator
                  {...props}
                  onSignOut={() => { AsyncStorage.removeItem('userToken'); setToken(null); }}
                />
              )}
            </Stack.Screen>

            {/* 2. Các màn hình con (Sẽ đè lên TabBar khi mở) */}
            <Stack.Screen
              name="CreateRoute"
              component={CreateRouteScreen}
              options={{ headerShown: true, title: 'Tạo Lộ Trình' }}
            />
            <Stack.Screen
              name="RouteDetail"
              component={RouteDetailScreen}
              options={{ headerShown: true, title: 'Chi Tiết Lộ Trình' }}
            />

          </Stack.Navigator>
        ) : (
          // --- KHI CHƯA ĐĂNG NHẬP ---
          <AuthStack onSignIn={(t) => { AsyncStorage.setItem('userToken', t); setToken(t); }} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;