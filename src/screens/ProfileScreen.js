// File: src/screens/ProfileScreen.js

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Switch,
    Alert,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://10.0.2.2:3000/api/auth/profile';

const ProfileScreen = ({ onSignOut }) => {
    const [userInfo, setUserInfo] = useState({
        full_name: '',
        phone: '',
        email: '',
        vehicle: '',
    });

    const [backupUserInfo, setBackupUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isNotiEnabled, setIsNotiEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);

    // --- HÀM MỚI: HIỂN THỊ THÔNG BÁO ---
    const showFeatureAlert = () => {
        Alert.alert(
            "Thông báo", // Tiêu đề (sẽ in đậm mặc định)
            "Tính năng này đang được cập nhật.\nXin cảm ơn!", // Nội dung (xuống dòng cho đẹp)
            [
                {
                    text: "Đóng",
                    style: "cancel", // Style nút hủy (màu xanh/đậm tùy OS)
                }
            ],
            { cancelable: true } // Cho phép bấm ra ngoài để tắt
        );
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error('Lỗi tải profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handleStartEdit = () => {
        setBackupUserInfo({ ...userInfo });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setUserInfo(backupUserInfo);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.put(API_URL, {
                fullName: userInfo.full_name,
                phone: userInfo.phone,
                vehicle: userInfo.vehicle
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsEditing(false);
            Alert.alert("Thành công", "Đã cập nhật thông tin!");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
        }
    };

    const handleLogoutPress = () => {
        Alert.alert(
            "Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng xuất", onPress: onSignOut, style: "destructive" }
            ]
        );
    };

    const InfoRow = ({ icon, label, fieldKey, keyboardType = 'default', editable = true }) => (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <Icon name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                {isEditing && editable ? (
                    <TextInput
                        style={styles.infoInput}
                        value={userInfo[fieldKey]}
                        onChangeText={(text) => setUserInfo({ ...userInfo, [fieldKey]: text })}
                        keyboardType={keyboardType}
                        autoCorrect={false}
                    />
                ) : (
                    <Text style={styles.infoValue}>{userInfo[fieldKey] || '(Chưa cập nhật)'}</Text>
                )}
            </View>
        </View>
    );

    const MenuItem = ({ icon, title, value, isSwitch, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={isSwitch}>
            <View style={styles.menuLeft}>
                <Icon name={icon} size={22} color={COLORS.textSub} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <View style={styles.menuRight}>
                {isSwitch ? (
                    <Switch
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={"#f4f3f4"}
                        onValueChange={onPress}
                        value={value}
                    />
                ) : (
                    <Icon name="chevron-forward" size={20} color="#ccc" />
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading && !userInfo.email) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatar} />
                        {isEditing && (
                            <TouchableOpacity style={styles.editAvatarBadge}>
                                <Icon name="camera" size={14} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.nameText}>{userInfo.full_name || 'Shipper'}</Text>
                    <Text style={styles.roleText}>Đối tác Shipper</Text>

                    <View style={styles.actionButtonsContainer}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEdit}>
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleStartEdit}>
                                <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    <View style={styles.card}>
                        <InfoRow icon="person-outline" label="Họ và tên" fieldKey="full_name" />
                        <View style={styles.divider} />
                        <InfoRow icon="call-outline" label="Số điện thoại" fieldKey="phone" keyboardType="phone-pad" />
                        <View style={styles.divider} />
                        <InfoRow icon="mail-outline" label="Email" fieldKey="email" editable={false} />
                        <View style={styles.divider} />
                        <InfoRow icon="bicycle-outline" label="Phương tiện" fieldKey="vehicle" />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="notifications-outline" title="Nhận thông báo đơn hàng"
                            isSwitch={true} value={isNotiEnabled}
                            onPress={() => setIsNotiEnabled(!isNotiEnabled)}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="location-outline" title="Chia sẻ vị trí thời gian thực"
                            isSwitch={true} value={isLocationEnabled}
                            onPress={() => setIsLocationEnabled(!isLocationEnabled)}
                        />
                        <View style={styles.divider} />
                        {/* CẬP NHẬT: Nút Ngôn ngữ */}
                        <MenuItem
                            icon="language-outline"
                            title="Ngôn ngữ"
                            onPress={showFeatureAlert}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                    <View style={styles.card}>
                        {/* CẬP NHẬT: Nút Trung tâm trợ giúp */}
                        <MenuItem
                            icon="help-circle-outline"
                            title="Trung tâm trợ giúp"
                            onPress={showFeatureAlert}
                        />
                        <View style={styles.divider} />
                        {/* CẬP NHẬT: Nút Điều khoản */}
                        <MenuItem
                            icon="document-text-outline"
                            title="Điều khoản & Chính sách"
                            onPress={showFeatureAlert}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
                    <Icon name="log-out-outline" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        alignItems: 'center', padding: 20, backgroundColor: 'white',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, elevation: 4, marginBottom: 20,
    },
    avatarContainer: { position: 'relative', marginBottom: 10 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#F2F2F7' },
    editAvatarBadge: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary,
        width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white',
    },
    nameText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    roleText: { fontSize: 14, color: COLORS.textSub, marginTop: 2 },
    actionButtonsContainer: { flexDirection: 'row', marginTop: 15, gap: 10 },
    actionButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    editButton: { borderWidth: 1, borderColor: COLORS.primary },
    editButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    saveButton: { backgroundColor: COLORS.primary, paddingHorizontal: 25 },
    saveButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    cancelButton: { backgroundColor: '#E5E5EA' },
    cancelButtonText: { color: '#666', fontWeight: '600', fontSize: 14 },
    section: { marginBottom: 20, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginLeft: 5, textTransform: 'uppercase' },
    card: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 5 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 44 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 2 },
    infoValue: { fontSize: 16, color: COLORS.textMain, fontWeight: '500' },
    infoInput: { fontSize: 16, color: COLORS.textMain, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: 0, height: 26 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuText: { fontSize: 16, color: COLORS.textMain, marginLeft: 12 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, padding: 15, backgroundColor: '#FFE5E5', borderRadius: 16 },
    logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});

export default ProfileScreen;