// File: src/screens/AuthScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import để lưu token

const API_URL = 'http://10.0.2.2:3000/api/auth';

const AuthScreen = ({ route }) => {
    // onSignIn là hàm từ App.js truyền vào để cập nhật trạng thái đăng nhập
    const { onSignIn } = route.params;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicle, setVehicle] = useState('');

    const [isRegistering, setIsRegistering] = useState(false);

    const handleAuth = async () => {
        // 1. Validate dữ liệu
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu.');
            return;
        }

        if (isRegistering && (!fullName || !phone || !vehicle)) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin (Họ tên, SĐT, Phương tiện).');
            return;
        }

        try {
            if (isRegistering) {
                // --- XỬ LÝ ĐĂNG KÝ ---
                await axios.post(`${API_URL}/register`, {
                    email, password, fullName, phone, vehicle
                });

                Alert.alert(
                    'Thành công',
                    'Đăng ký thành công! Vui lòng đăng nhập.',
                    [
                        { text: 'OK', onPress: () => setIsRegistering(false) } // Chuyển về màn hình đăng nhập
                    ]
                );
            } else {
                // --- XỬ LÝ ĐĂNG NHẬP ---
                const res = await axios.post(`${API_URL}/login`, { email, password });

                if (res.data.token) {
                    // 1. Lưu token vào bộ nhớ máy để lần sau tự động đăng nhập
                    await AsyncStorage.setItem('userToken', res.data.token);

                    // 2. Gọi hàm onSignIn để App.tsx biết và chuyển màn hình
                    onSignIn(res.data.token);
                }
            }
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.error || 'Thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isRegistering ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP'}</Text>

            {/* Các trường chung: Email & Password */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {/* Các trường CHỈ hiện khi Đăng ký */}
            {isRegistering && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Họ và tên"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phương tiện (VD: Honda Vision 29A-12345)"
                        value={vehicle}
                        onChangeText={setVehicle}
                    />
                </>
            )}

            {/* Nút Hành động */}
            <TouchableOpacity style={styles.btn} onPress={handleAuth}>
                <Text style={styles.btnText}>{isRegistering ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</Text>
            </TouchableOpacity>

            {/* Nút Chuyển đổi chế độ */}
            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={styles.link}>
                    {isRegistering ? 'Đã có tài khoản? Quay lại Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
    btn: { backgroundColor: '#007AFF', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    link: { textAlign: 'center', color: '#007AFF', fontSize: 15, marginTop: 10 }
});

export default AuthScreen;