import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './src/navigation/AuthStack';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { Text, View } from 'react-native';


const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userToken').then(t => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow' }}>

        <Text>Đang tải...</Text>
      </View>
    );
  };

  return (

    <SafeAreaProvider>
      <NavigationContainer>
        {token ? (
          <MainTabNavigator onSignOut={() => { AsyncStorage.removeItem('userToken'); setToken(null); }} />
        ) : (
          <AuthStack onSignIn={(t) => { AsyncStorage.setItem('userToken', t); setToken(t); }} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>

  );
};

export default App;