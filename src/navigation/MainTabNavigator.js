import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// 1. XÓA dòng này: import HomeStack from './HomeStack';
// 2. THAY BẰNG dòng này:
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default ({ onSignOut }) => (
    <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false, // Ẩn header của Tab (để dùng header của Stack hoặc tự custom)
        tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'TabHome') iconName = 'home';
            else if (route.name === 'TabProfile') iconName = 'person';
            return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
    })}>

        {/* SỬA: Dùng trực tiếp HomeScreen, không dùng HomeStack nữa */}
        <Tab.Screen
            name="TabHome"
            component={HomeScreen}
            options={{ title: 'Trang chủ' }}
        />

        {/* Tab Profile giữ nguyên cách truyền props */}
        <Tab.Screen
            name="TabProfile"
            options={{ title: 'Tài khoản' }}
        >
            {/* Cách viết này giúp truyền props onSignOut xuống ProfileScreen */}
            {props => <ProfileScreen {...props} onSignOut={onSignOut} />}
        </Tab.Screen>

    </Tab.Navigator>
);