import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateRouteScreen from '../screens/CreateRouteScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
const Stack = createNativeStackNavigator();
export default () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateRoute" component={CreateRouteScreen} options={{ title: 'Tạo Lộ Trình' }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Chi Tiết' }} />
    </Stack.Navigator>
);