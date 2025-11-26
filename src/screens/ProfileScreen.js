// File: src/screens/ProfileScreen.js

import React, { useState } from 'react';
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
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors'; // Đảm bảo bạn đã có file này từ bước trước

const ProfileScreen = ({ onSignOut }) => {
    // State cho thông tin người dùng
    const [userInfo, setUserInfo] = useState({
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        email: 'shipper@example.com',
        vehicle: 'Honda Wave - 29A1-123.45',
    });

    // State cho chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);

    // State cho các cài đặt (Toggle)
    const [isNotiEnabled, setIsNotiEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);

    // Hàm xử lý lưu thông tin
    const handleSave = () => {
        // Tại đây bạn sẽ gọi API PUT để cập nhật thông tin lên server
        setIsEditing(false);
        Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật!");
    };

    // Hàm xử lý đăng xuất
    const handleLogoutPress = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất không?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng xuất", onPress: onSignOut, style: "destructive" }
            ]
        );
    };

    // Component con: Dòng thông tin (Input hoặc Text)
    const InfoRow = ({ icon, label, value, fieldName, keyboardType = 'default' }) => (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <Icon name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.infoInput}
                        value={userInfo[fieldName]}
                        onChangeText={(text) => setUserInfo({ ...userInfo, [fieldName]: text })}
                        keyboardType={keyboardType}
                    />
                ) : (
                    <Text style={styles.infoValue}>{value}</Text>
                )}
            </View>
        </View>
    );

    // Component con: Mục cài đặt (Menu Item)
    const MenuItem = ({ icon, title, value, isSwitch, onPress }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={styles.menuLeft}>
                <Icon name={icon} size={22} color={COLORS.textSub} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <View style={styles.menuRight}>
                {isSwitch ? (
                    <Switch
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
                        onValueChange={onPress}
                        value={value}
                    />
                ) : (
                    <Icon name="chevron-forward" size={20} color="#ccc" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* --- HEADER: AVATAR & TÊN --- */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=11' }} // Ảnh mẫu
                            style={styles.avatar}
                        />
                        {isEditing && (
                            <TouchableOpacity style={styles.editAvatarBadge}>
                                <Icon name="camera" size={14} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.nameText}>{userInfo.name}</Text>
                    <Text style={styles.roleText}>Đối tác Shipper</Text>

                    <TouchableOpacity
                        style={[styles.editButton, isEditing && styles.saveButton]}
                        onPress={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                        <Text style={[styles.editButtonText, isEditing && { color: 'white' }]}>
                            {isEditing ? "Lưu thay đổi" : "Chỉnh sửa hồ sơ"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- PHẦN 1: THÔNG TIN CÁ NHÂN --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    <View style={styles.card}>
                        <InfoRow icon="person-outline" label="Họ và tên" value={userInfo.name} fieldName="name" />
                        <View style={styles.divider} />
                        <InfoRow icon="call-outline" label="Số điện thoại" value={userInfo.phone} fieldName="phone" keyboardType="phone-pad" />
                        <View style={styles.divider} />
                        <InfoRow icon="mail-outline" label="Email" value={userInfo.email} fieldName="email" keyboardType="email-address" />
                        <View style={styles.divider} />
                        <InfoRow icon="bicycle-outline" label="Phương tiện" value={userInfo.vehicle} fieldName="vehicle" />
                    </View>
                </View>

                {/* --- PHẦN 2: CÀI ĐẶT CHUNG --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="notifications-outline"
                            title="Nhận thông báo đơn hàng"
                            isSwitch={true}
                            value={isNotiEnabled}
                            onPress={() => setIsNotiEnabled(!isNotiEnabled)}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="location-outline"
                            title="Chia sẻ vị trí thời gian thực"
                            isSwitch={true}
                            value={isLocationEnabled}
                            onPress={() => setIsLocationEnabled(!isLocationEnabled)}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="language-outline"
                            title="Ngôn ngữ"
                            onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}
                        />
                    </View>
                </View>

                {/* --- PHẦN 3: HỖ TRỢ --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon="help-circle-outline"
                            title="Trung tâm trợ giúp"
                            onPress={() => { }}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="document-text-outline"
                            title="Điều khoản & Chính sách"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* --- NÚT ĐĂNG XUẤT --- */}
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
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', // Nền xám nhạt iOS
    },
    // Header
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
        width: 80, height: 80,
        borderRadius: 40,
        borderWidth: 3, borderColor: '#F2F2F7',
    },
    editAvatarBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: COLORS.primary,
        width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'white',
    },
    nameText: {
        fontSize: 20, fontWeight: 'bold', color: COLORS.textMain,
    },
    roleText: {
        fontSize: 14, color: COLORS.textSub, marginTop: 2,
    },
    editButton: {
        marginTop: 15,
        paddingVertical: 8, paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1, borderColor: COLORS.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    editButtonText: {
        color: COLORS.primary, fontWeight: '600', fontSize: 14,
    },

    // Section Styles
    section: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14, fontWeight: '600', color: '#8E8E93',
        marginBottom: 10, marginLeft: 5, textTransform: 'uppercase',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    divider: {
        height: 1, backgroundColor: '#F0F0F0',
        marginLeft: 40, // Thụt vào để đẹp hơn
    },

    // Info Row Styles
    infoRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 32, height: 32, borderRadius: 6,
        backgroundColor: '#F0F8FF', // Nền xanh rất nhạt
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12, color: '#8E8E93', marginBottom: 2,
    },
    infoValue: {
        fontSize: 16, color: COLORS.textMain, fontWeight: '500',
    },
    infoInput: {
        fontSize: 16, color: COLORS.textMain, fontWeight: '500',
        borderBottomWidth: 1, borderBottomColor: COLORS.primary,
        paddingVertical: 0, height: 24,
    },

    // Menu Item Styles
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12,
    },
    menuLeft: {
        flexDirection: 'row', alignItems: 'center',
    },
    menuText: {
        fontSize: 16, color: COLORS.textMain, marginLeft: 12,
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginHorizontal: 20, padding: 15,
        backgroundColor: '#FFE5E5', // Nền đỏ nhạt
        borderRadius: 12,
    },
    logoutText: {
        color: COLORS.danger, fontWeight: 'bold', fontSize: 16, marginLeft: 8,
    },
});

export default ProfileScreen;