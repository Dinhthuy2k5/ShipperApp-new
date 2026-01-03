// File: src/screens/RouteDetailScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ActivityIndicator,
    Alert,
    PermissionsAndroid,
    Platform,
    DeviceEventEmitter // Đã import đúng
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RouteDetailMap from '../components/RouteDetailMap';
import RouteDetailSheet from '../components/RouteDetailSheet';

const BASE = 'http://10.0.2.2:3000/api/routes';

const RouteDetailScreen = ({ route }) => {
    const { routeId } = route.params;
    const [data, setData] = useState(null);
    const [newStop, setNewStop] = useState('');
    const [isNavigationMode, setIsNavigationMode] = useState(false);

    // --- XIN QUYỀN & BẬT DẪN ĐƯỜNG ---
    const handleToggleNavigation = async () => {
        if (isNavigationMode) {
            setIsNavigationMode(false);
        } else {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: "Quyền truy cập vị trí",
                            message: "ShipperApp cần truy cập vị trí để dẫn đường.",
                            buttonNeutral: "Hỏi lại sau",
                            buttonNegative: "Hủy",
                            buttonPositive: "Đồng ý"
                        }
                    );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        setIsNavigationMode(true);
                    } else {
                        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền vị trí để sử dụng tính năng này.");
                    }
                } catch (err) {
                    console.warn(err);
                }
            } else {
                setIsNavigationMode(true);
            }
        }
    };

    const loadData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${BASE}/${routeId}`, { headers: { Authorization: `Bearer ${token}` } });
            setData(res.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    }, [routeId]);

    useEffect(() => { loadData(); }, [loadData]);

    // --- HÀM XỬ LÝ API CHUNG (Thêm phát tín hiệu tại đây) ---
    const apiCall = async (method, url, body = {}) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            // 1. Gọi API thay đổi dữ liệu
            await axios({ method, url, data: body, headers: { Authorization: `Bearer ${token}` } });

            // 2. Tải lại dữ liệu cho màn hình Chi tiết này
            loadData();

            // 3. Bắn tín hiệu cập nhật
            DeviceEventEmitter.emit('REFRESH_ROUTES'); // Cập nhật Trang chủ (Cũ)

            // --- THÊM DÒNG NÀY ---
            DeviceEventEmitter.emit('REFRESH_PROFILE'); // Cập nhật màn hình Profile
            // --------------------

        } catch (error) {
            console.error("Lỗi thao tác:", error);
            Alert.alert("Lỗi", "Không thể thực hiện thao tác. Vui lòng thử lại.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {data ? (
                <>
                    <RouteDetailMap
                        routeDetails={data}
                        isNavigationMode={isNavigationMode}
                    />
                    <RouteDetailSheet
                        routeDetails={data}
                        isCompleted={data.route_status === 'completed'}
                        newStopAddress={newStop}
                        setNewStopAddress={setNewStop}
                        // Gọi apiCall cho các hành động:
                        handleAddStop={() => {
                            if (!newStop.trim()) { Alert.alert("Lỗi", "Vui lòng nhập địa chỉ"); return; }
                            apiCall('post', `${BASE}/${routeId}/stops`, { addressText: newStop });
                            setNewStop('');
                        }}
                        handleDeleteStop={(id) => apiCall('delete', `${BASE}/${routeId}/stops/${id}`)}
                        handleUpdateStopStatus={(id, s) => apiCall('patch', `${BASE}/${routeId}/stops/${id}`, { status: s === 'delivered' ? 'failed' : s === 'failed' ? 'pending' : 'delivered' })}
                        handleManualCompleteRoute={() => apiCall('patch', `${BASE}/${routeId}/status`, { status: 'completed' })}
                        handleOptimizeRoute={() => apiCall('post', `${BASE}/${routeId}/optimize`)}

                        isNavigationMode={isNavigationMode}
                        handleToggleNavigation={handleToggleNavigation}
                    />
                </>
            ) : <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />}
        </View>
    );
};

export default RouteDetailScreen;