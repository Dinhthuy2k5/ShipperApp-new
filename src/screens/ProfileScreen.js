// File: src/screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
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
// LƯU Ý: Không dùng useFocusEffect nữa để tránh load lại liên tục

const API_URL = 'http://10.0.2.2:3000/api/auth/profile';

const ProfileScreen = ({ onSignOut }) => {
    const [userInfo, setUserInfo] = useState({
        full_name: '',
        phone: '',
        email: '',
        vehicle: '',
    });

    const [backupUserInfo, setBackupUserInfo] = useState(null);
    const [loading, setLoading] = useState(true); // Mặc định là true để load lần đầu
    const [isEditing, setIsEditing] = useState(false);
    const [isNotiEnabled, setIsNotiEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);

    const [stats, setStats] = useState({
        daysActive: 0,
        totalRoutes: 0,
        totalDistanceKm: 0,
        successDeliveries: 0,
        rating: 0,
    });

    // --- HÀM: HIỂN THỊ THÔNG BÁO ---
    const showFeatureAlert = () => {
        Alert.alert(
            "Thông báo",
            "Tính năng này đang được cập nhật.\nXin cảm ơn!",
            [{ text: "Đóng", style: "cancel" }],
            { cancelable: true }
        );
    };

    // --- 1. HÀM TẢI DỮ LIỆU ---
    const fetchProfile = async () => {
        console.log("ProfileScreen: Đang tải dữ liệu..."); // Log để kiểm tra
        try {
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
    // Hàm tải thống kê 
    const fetchStats = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get('http://10.0.2.2:3000/api/stats/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Lỗi tải thống kê:', error);
        }
    };

    // --- 2. OPTIMIZATION: CHỈ TẢI 1 LẦN KHI MỞ APP ---
    // Thay thế useFocusEffect bằng useEffect với dependency rỗng []
    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    // --- 3. CÁC HÀM XỬ LÝ ---
    const handleStartEdit = () => {
        setBackupUserInfo({ ...userInfo }); // Lưu bản sao lưu
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setUserInfo(backupUserInfo); // Khôi phục dữ liệu cũ
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true); // Hiện loading nhẹ khi lưu
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

            // QUAN TRỌNG: Chỉ tải lại dữ liệu khi đã Lưu thành công
            fetchProfile();

        } catch (error) {
            setLoading(false);
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

    // --- COMPONENT CON ---
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
                        value={userInfo[fieldKey]} // SỬA: Lấy đúng key
                        onChangeText={(text) => setUserInfo({ ...userInfo, [fieldKey]: text })} // SỬA: Cập nhật đúng key
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

    const StatItem = ({ label, value, icon, color }) => (
        <View style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    // Render Loading toàn màn hình (chỉ khi chưa có dữ liệu lần đầu)
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

                {/* HEADER */}
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
                                    {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleStartEdit}>
                                <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- PHẦN MỚI: THỐNG KÊ HOẠT ĐỘNG --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thống kê hoạt động</Text>

                    {/* Hàng 1: Tổng quan */}
                    <View style={styles.statsGrid}>
                        <StatItem
                            icon="calendar"
                            label="Ngày hoạt động"
                            value={`${stats.daysActive} ngày`}
                            color="#FF9500"
                        />
                        <StatItem
                            icon="cube"
                            label="Đơn giao xong"
                            value={stats.successDeliveries}
                            color="#34C759"
                        />
                    </View>

                    {/* Hàng 2: Di chuyển */}
                    <View style={[styles.statsGrid, { marginTop: 10 }]}>
                        <StatItem
                            icon="speedometer"
                            label="Tổng quãng đường"
                            value={`${stats.totalDistanceKm} km`}
                            color="#007AFF"
                        />
                        <StatItem
                            icon="star"
                            label="Đánh giá"
                            value={`${stats.rating} ⭐`}
                            color="#FFCC00"
                        />
                    </View>
                </View>

                {/* THÔNG TIN */}
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

                {/* CÀI ĐẶT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
                    <View style={styles.card}>
                        <MenuItem icon="notifications-outline" title="Nhận thông báo đơn hàng" isSwitch={true} value={isNotiEnabled} onPress={() => setIsNotiEnabled(!isNotiEnabled)} />
                        <View style={styles.divider} />
                        <MenuItem icon="location-outline" title="Chia sẻ vị trí thời gian thực" isSwitch={true} value={isLocationEnabled} onPress={() => setIsLocationEnabled(!isLocationEnabled)} />
                        <View style={styles.divider} />
                        <MenuItem icon="language-outline" title="Ngôn ngữ" onPress={showFeatureAlert} />
                    </View>
                </View>

                {/* HỖ TRỢ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                    <View style={styles.card}>
                        <MenuItem icon="help-circle-outline" title="Trung tâm trợ giúp" onPress={showFeatureAlert} />
                        <View style={styles.divider} />
                        <MenuItem icon="document-text-outline" title="Điều khoản & Chính sách" onPress={showFeatureAlert} />
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

// --- Styles giữ nguyên như cũ ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, elevation: 4, marginBottom: 20 },
    avatarContainer: { position: 'relative', marginBottom: 10 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#F2F2F7' },
    editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
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
    // Styles cho Thống kê
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
    },
    statIconBox: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    statValue: {
        fontSize: 16, fontWeight: 'bold', color: COLORS.textMain,
    },
    statLabel: {
        fontSize: 12, color: '#8E8E93',
    },
});

export default ProfileScreen;