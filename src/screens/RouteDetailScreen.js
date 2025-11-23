import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RouteDetailMap from '../components/RouteDetailMap';
import RouteDetailSheet from '../components/RouteDetailSheet';

const BASE = 'http://10.0.2.2:3000/api/routes';

const RouteDetailScreen = ({ route }) => {
    const { routeId } = route.params;
    const [data, setData] = useState(null);
    const [newStop, setNewStop] = useState('');

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
                    <RouteDetailMap routeDetails={data} />
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
                    />
                </>
            ) : <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />}
        </View>
    );
};

export default RouteDetailScreen;