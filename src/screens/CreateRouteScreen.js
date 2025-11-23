import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateRouteScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [start, setStart] = useState('');

    const handleCreate = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // 1. Tạo route
            const res1 = await axios.post('http://10.0.2.2:3000/api/routes', { routeName: name }, { headers: { Authorization: `Bearer ${token}` } });
            const routeId = res1.data.routeId;
            // 2. Cập nhật điểm bắt đầu
            await axios.put(`http://10.0.2.2:3000/api/routes/${routeId}/start-point`, { addressText: start }, { headers: { Authorization: `Bearer ${token}` } });
            // 3. Chuyển trang
            navigation.replace('RouteDetail', { routeId });
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể tạo lộ trình');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Tên lộ trình:</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="VD: Đơn sáng nay" />
            <Text style={styles.label}>Điểm xuất phát:</Text>
            <TextInput style={styles.input} value={start} onChangeText={setStart} placeholder="VD: Kho A" />
            <TouchableOpacity style={styles.btn} onPress={handleCreate}><Text style={styles.btnText}>TẠO</Text></TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontWeight: 'bold', marginTop: 20, marginBottom: 5 },
    input: { height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 },
    btn: { backgroundColor: '#007AFF', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
    btnText: { color: '#fff', fontWeight: 'bold' }
});

export default CreateRouteScreen;