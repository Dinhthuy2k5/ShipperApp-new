import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Alert,
    View,
    // THÊM 2 CÁI NÀY VÀO ĐÂY:
    PermissionsAndroid,
    Platform
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
    const [isNavigationMode, setIsNavigationMode] = useState(false); // <-- STATE MỚI

    // --- HÀM MỚI: XIN QUYỀN & BẬT DẪN ĐƯỜNG ---
    const handleToggleNavigation = async () => {
        if (isNavigationMode) {
            setIsNavigationMode(false);
        } else {
            if (Platform.OS === 'android') {
                try {
                    // Xin quyền Fine Location (Chính xác)
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
                        console.log("Đã cấp quyền vị trí");
                        setIsNavigationMode(true);
                    } else {
                        console.log("Quyền vị trí bị từ chối");
                        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền vị trí trong cài đặt để sử dụng tính năng này.");
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
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(`${BASE}/${routeId}`, { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
    }, [routeId]);

    useEffect(() => { loadData(); }, [loadData]);

    const apiCall = async (method, url, body = {}) => {
        const token = await AsyncStorage.getItem('userToken');
        await axios({ method, url, data: body, headers: { Authorization: `Bearer ${token}` } });
        loadData();
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
                        handleAddStop={() => { apiCall('post', `${BASE}/${routeId}/stops`, { addressText: newStop }); setNewStop(''); }}
                        handleDeleteStop={(id) => apiCall('delete', `${BASE}/${routeId}/stops/${id}`)}
                        handleUpdateStopStatus={(id, s) => apiCall('patch', `${BASE}/${routeId}/stops/${id}`, { status: s === 'delivered' ? 'failed' : s === 'failed' ? 'pending' : 'delivered' })}
                        handleManualCompleteRoute={() => apiCall('patch', `${BASE}/${routeId}/status`, { status: 'completed' })}
                        handleOptimizeRoute={() => apiCall('post', `${BASE}/${routeId}/optimize`)}
                        isNavigationMode={isNavigationMode}
                        handleToggleNavigation={handleToggleNavigation}
                    />
                </>
            ) : <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />}
        </View>
    );
};

export default RouteDetailScreen;