import React from 'react';
import { View, Button } from 'react-native';
export default ({ onSignOut }) => (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Button title="ĐĂNG XUẤT" color="red" onPress={onSignOut} />
    </View>
);