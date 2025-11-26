import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
export default ({ onSignOut }) => (
    <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Icon name={route.name === 'TabHome' ? 'home' : 'person'} size={size} color={color} />
    })}>
        <Tab.Screen name="TabHome" component={HomeStack} options={{ title: 'Trang chủ' }} />
        <Tab.Screen name="TabProfile" children={() => <ProfileScreen onSignOut={onSignOut} />} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
);