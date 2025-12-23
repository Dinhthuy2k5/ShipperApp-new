import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SectionList, SafeAreaView, StatusBar, ActivityIndicator, TextInput, Image,
    DeviceEventEmitter,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/colors';

// Import Component và Hook đã tách
import FilterModal from '../components/FilterModal';
import { useRouteFilter } from '../hooks/useRouteFilter';

const API_URL = 'http://10.0.2.2:3000/api/routes';

const getUsernameFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.user.fullName || 'Shipper';
    } catch (e) { return 'Shipper'; }
};

const HomeScreen = ({ navigation }) => {
    const [routes, setRoutes] = useState([]);
    const [username, setUsername] = useState('Shipper');
    const [loading, setLoading] = useState(false);
    const [isFilterModalVisible, setModalVisible] = useState(false);

    // --- SỬ DỤNG CUSTOM HOOK ---
    // (Mọi logic lọc/sắp xếp/nhóm đều nằm trong hook này)
    const {
        searchText, setSearchText,
        filterStatus, setFilterStatus,
        sortOrder, setSortOrder,
        sections
    } = useRouteFilter(routes);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) { setLoading(false); return; }
            setUsername(getUsernameFromToken(token));

            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoutes(response.data);
        } catch (error) {
            // --- BẮT LỖI 401 Ở ĐÂY ---
            if (error.response && error.response.status === 401) {
                console.log("Token hết hạn hoặc không hợp lệ");

                Alert.alert(
                    "Phiên đăng nhập hết hạn",
                    "Vui lòng đăng nhập lại để tiếp tục.",
                    [
                        {
                            text: "Đồng ý",
                            onPress: async () => {
                                // 1. Xóa token rác
                                await AsyncStorage.removeItem('userToken');
                                // 2. Bắn tín hiệu ra ngoài để App.js biết mà chuyển màn hình
                                DeviceEventEmitter.emit('AUTH_EXPIRED');
                            }
                        }
                    ]
                );
            } else {
                console.error('Lỗi tải lộ trình:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Tải dữ liệu lần đầu tiên khi mở App
        loadData();

        // 2. Đăng ký lắng nghe sự kiện "REFRESH_ROUTES"
        // Khi nào các màn hình khác phát tín hiệu này, ta mới tải lại
        const listener = DeviceEventEmitter.addListener('REFRESH_ROUTES', () => {
            console.log("Nhận tín hiệu làm mới dữ liệu...");
            loadData();
        });

        // Dọn dẹp khi thoát
        return () => {
            listener.remove();
        };
    }, []); // Dependency rỗng -> Chỉ chạy 1 lần lúc mount

    const renderRouteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Icon name="map-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
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

                <View style={[styles.statusBadge, item.route_status === 'completed' ? styles.bgSuccess : styles.bgPending]}>
                    <Text style={[styles.statusText, item.route_status === 'completed' ? { color: 'green' } : { color: '#FF9500' }]}>
                        {item.route_status === 'completed' ? '● Hoàn thành' : '● Đang chờ'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greetingSub}>Xin chào,</Text>
                    <Text style={styles.greetingName}>{username}!</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('TabProfile')}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarSmall} />
                </TouchableOpacity>
            </View>

            <View style={styles.actionContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm lộ trình..."
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCorrect={false}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Icon name="close-circle" size={18} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateRoute')}>
                    <Icon name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.listTitleContainer}>
                <Text style={styles.sectionTitleMain}>Lộ trình gần đây</Text>
                <TouchableOpacity
                    style={[styles.filterButton, filterStatus !== 'all' && styles.filterButtonActive]}
                    onPress={() => setModalVisible(true)}
                >
                    <Icon name="options-outline" size={18} color={filterStatus !== 'all' ? COLORS.primary : "#666"} />
                    <Text style={[styles.filterButtonText, filterStatus !== 'all' && { color: COLORS.primary }]}>
                        Lọc {filterStatus !== 'all' ? '(1)' : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderRouteItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>{title}</Text></View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        stickySectionHeadersEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="document-text-outline" size={50} color="#ddd" />
                                <Text style={{ marginTop: 10, color: '#999' }}>{searchText ? "Không tìm thấy kết quả" : "Chưa có lộ trình nào"}</Text>
                            </View>
                        }
                        // THÊM TÍNH NĂNG KÉO ĐỂ LÀM MỚI (Thủ công)
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={loadData} colors={[COLORS.primary]} />
                        }
                    />
                )}
            </View>

            {/* COMPONENT LỌC ĐÃ TÁCH RA */}
            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setModalVisible(false)}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />
        </SafeAreaView>
    );
};

// ... (Phần styles của HomeScreen giữ nguyên như cũ, bạn copy từ file cũ sang)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    headerContainer: { padding: 20, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greetingSub: { fontSize: 14, color: '#666', fontWeight: '500' },
    greetingName: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    actionContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', height: 48, borderRadius: 12, marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2, paddingRight: 10 },
    searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333', height: '100%' },
    addButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 4 },
    listTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
    sectionTitleMain: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    filterButton: { flexDirection: 'row', alignItems: 'center', padding: 5 },
    filterButtonText: { marginLeft: 5, fontSize: 14, color: '#666', fontWeight: '600' },
    filterButtonActive: { backgroundColor: '#EDF2FA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    sectionHeader: { paddingHorizontal: 20, paddingVertical: 8 },
    sectionHeaderText: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
    card: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    routeName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', flex: 1 },
    metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    metaText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#333' },
    pendingText: { fontSize: 13, color: '#8E8E93', fontStyle: 'italic', marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    bgSuccess: { backgroundColor: '#E8F5E9' },
    bgPending: { backgroundColor: '#FFF3E0' },
    statusText: { fontSize: 12, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
});

export default HomeScreen;