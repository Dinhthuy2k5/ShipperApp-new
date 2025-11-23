// File: src/screens/HomeScreen.js

import React, { useState, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SectionList, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- QUAN TRỌNG

const API_URL = 'http://10.0.2.2:3000/api/routes';

const getUsernameFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.user.fullName || 'Shipper';
    } catch (e) {
        return 'Shipper';
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Bỏ props userToken, chúng ta tự lấy
const HomeScreen = ({ navigation }) => {
    const [routes, setRoutes] = useState([]);
    const [username, setUsername] = useState('Shipper');
    const [loading, setLoading] = useState(false);

    // Hàm tải dữ liệu
    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Lấy token trực tiếp từ bộ nhớ (An toàn nhất)
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                console.log("Không tìm thấy token trong Storage");
                setLoading(false);
                return;
            }

            // 2. Giải mã tên
            setUsername(getUsernameFromToken(token));

            // 3. Gọi API
            console.log("Đang gọi API lấy lộ trình...");
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Đã tải được:", response.data.length, "lộ trình");
            setRoutes(response.data);

        } catch (error) {
            console.error('Lỗi tải lộ trình:', error.message);
            if (error.response) {
                console.log("Server trả về:", error.response.status, error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    // Dùng useFocusEffect để luôn tải lại khi vào màn hình
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // --- LOGIC NHÓM (Giữ nguyên) ---
    const sections = useMemo(() => {
        const groups = routes.reduce((acc, route) => {
            const dateKey = formatDate(route.created_at);
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(route);
            return acc;
        }, {});

        return Object.keys(groups).map(date => ({
            title: date,
            data: groups[date]
        })).sort((a, b) => new Date(b.title) - new Date(a.title)); // Sắp xếp ngày mới nhất lên đầu
    }, [routes]);

    const renderRouteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Icon name="map-outline" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={styles.routeName}>{item.route_name}</Text>
            </View>

            <View style={styles.cardBody}>
                {item.total_distance_meters ? (
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Icon name="speedometer-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>{(item.total_distance_meters / 1000).toFixed(1)} km</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="time-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>~{Math.round(item.total_duration_seconds / 60)} phút</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.pendingText}>Chưa tối ưu hóa</Text>
                )}

                <View style={[
                    styles.statusBadge,
                    item.route_status === 'completed' ? styles.bgSuccess : styles.bgPending
                ]}>
                    <Text style={styles.statusText}>
                        {item.route_status === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

            <View style={styles.headerContainer}>
                <Text style={styles.greetingSub}>Xin chào,</Text>
                <Text style={styles.greetingName}>{username}!</Text>
            </View>

            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateRoute')}
            >
                <Icon name="search" size={20} color="#666" />
                <Text style={styles.createButtonText}>Tìm kiếm hoặc Tạo lộ trình mới</Text>
                <Icon name="add-circle" size={28} color="#007AFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitleMain}>Lộ trình gần đây</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderRouteItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>{title}</Text>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        stickySectionHeadersEnabled={false}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                                Chưa có lộ trình nào. Hãy tạo mới!
                            </Text>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

// (Styles giữ nguyên như cũ)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    headerContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    greetingSub: { fontSize: 16, color: '#666', fontWeight: '500' },
    greetingName: { fontSize: 28, fontWeight: '800', color: '#1C1C1E' },
    createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    createButtonText: { flex: 1, fontSize: 15, marginLeft: 10, color: '#8E8E93' },
    sectionTitleMain: { fontSize: 18, fontWeight: '700', marginLeft: 20, marginBottom: 10, color: '#1C1C1E' },
    sectionHeader: { paddingHorizontal: 20, paddingVertical: 8 },
    sectionHeaderText: { fontSize: 14, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
    card: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    routeName: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', flex: 1 },
    cardBody: { marginTop: 4 },
    metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    metaText: { marginLeft: 4, fontSize: 13, fontWeight: '600', color: '#333' },
    pendingText: { fontSize: 13, color: '#8E8E93', fontStyle: 'italic', marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    bgSuccess: { backgroundColor: '#E8F5E9' },
    bgPending: { backgroundColor: '#FFF3E0' },
    statusText: { fontSize: 12, fontWeight: '700', color: '#333' }
});

export default HomeScreen;