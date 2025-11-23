import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api/auth';

const AuthScreen = ({ route }) => {
    const { onSignIn } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleAuth = async () => {
        try {
            if (isRegistering) {
                await axios.post(`${API_URL}/register`, { email, password, fullName });
                Alert.alert('Thành công', 'Đăng ký thành công! Đang đăng nhập...');
            }
            const res = await axios.post(`${API_URL}/login`, { email, password });
            if (res.data.token) onSignIn(res.data.token);
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.error || 'Thất bại');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isRegistering ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            {isRegistering && <TextInput style={styles.input} placeholder="Họ tên" value={fullName} onChangeText={setFullName} />}
            <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.btn} onPress={handleAuth}><Text style={styles.btnText}>{isRegistering ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}><Text style={styles.link}>{isRegistering ? 'Quay lại Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</Text></TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
    btn: { backgroundColor: '#007AFF', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    link: { textAlign: 'center', color: '#007AFF' }
});

export default AuthScreen;