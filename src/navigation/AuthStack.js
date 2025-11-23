import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
const Stack = createNativeStackNavigator();
export default ({ onSignIn }) => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} initialParams={{ onSignIn }} />
    </Stack.Navigator>
);