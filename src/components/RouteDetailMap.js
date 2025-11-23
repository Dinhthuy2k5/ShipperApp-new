// File: src/components/RouteDetailMap.js

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { decodePolyline, getBounds } from '../utils/mapUtils';
import { COLORS } from '../utils/colors'; // Import bộ màu chuẩn

// Import Token
import { MAPBOX_ACCESS_TOKEN } from '../utils/config';
if (!MAPBOX_ACCESS_TOKEN) MapboxGL.setAccessToken("pk.eyJ...");

const RouteDetailMap = ({ routeDetails, isNavigationMode }) => {
    const cameraRef = useRef(null);

    // Effect: Tự động zoom (Chỉ chạy khi KHÔNG ở chế độ dẫn đường)
    useEffect(() => {
        if (!isNavigationMode && cameraRef.current && routeDetails && routeDetails.start_lat) {
            const validStops = routeDetails.stops.filter(stop => stop.lat && stop.lng);
            const stopsCoords = validStops.map(stop => [stop.lng, stop.lat]);
            const allCoords = [[routeDetails.start_lng, routeDetails.start_lat], ...stopsCoords];

            // Zoom camera để bao quát toàn bộ lộ trình
            cameraRef.current.fitBounds(
                getBounds(allCoords)[0],
                getBounds(allCoords)[1],
                50, // Padding
                1000 // Animation duration
            );
        }
    }, [routeDetails, isNavigationMode]);

    return (
        <MapboxGL.MapView
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Street}
            logoEnabled={false}
            compassEnabled={true}
            compassViewPosition={3}
        >
            <MapboxGL.Camera
                ref={cameraRef}
                defaultSettings={{
                    centerCoordinate: [105.85, 21.02],
                    zoomLevel: 14,
                }}
                // Logic Dẫn đường: Bám theo vị trí người dùng
                followUserLocation={isNavigationMode}
                followUserMode={isNavigationMode ? 'course' : 'normal'}
                followZoomLevel={16}
                followPitch={isNavigationMode ? 45 : 0}
            />

            {/* Hiển thị vị trí Shipper (Chấm xanh) */}
            <MapboxGL.UserLocation
                visible={true}
                animated={true}
                showsUserHeadingIndicator={true}
                androidRenderMode="gps"
            />

            {/* 1. Điểm Bắt đầu */}
            {routeDetails?.start_lat && (
                <MapboxGL.PointAnnotation
                    id="startPoint"
                    coordinate={[routeDetails.start_lng, routeDetails.start_lat]}
                >
                    <View style={styles.markerStart}>
                        <Icon name="navigate" size={20} color="#fff" />
                    </View>
                </MapboxGL.PointAnnotation>
            )}

            {/* 2. Các Điểm dừng */}
            {routeDetails?.stops?.map((stop) => {
                if (!stop.lat || !stop.lng) return null;
                return (
                    <MapboxGL.PointAnnotation
                        key={stop.id}
                        id={stop.id.toString()}
                        coordinate={[stop.lng, stop.lat]}
                    >
                        <View style={[
                            styles.markerStop,
                            // Logic màu sắc: Xanh dương nếu đã tối ưu, Xanh lá nếu đã giao
                            stop.optimized_order && { backgroundColor: COLORS.primary },
                            stop.stop_status === 'delivered' && { backgroundColor: COLORS.success }
                        ]}>
                            <Text style={styles.markerText}>{stop.optimized_order || '!'}</Text>
                        </View>
                    </MapboxGL.PointAnnotation>
                );
            })}

            {/* 3. Đường đi (Polyline) */}
            {routeDetails?.overview_polyline && (
                <MapboxGL.ShapeSource
                    id="routeSource"
                    shape={{
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: decodePolyline(routeDetails.overview_polyline),
                        },
                    }}
                >
                    <MapboxGL.LineLayer
                        id="routeLine"
                        style={{ lineColor: COLORS.primary, lineWidth: 5, lineOpacity: 0.8, lineCap: 'round' }}
                    />
                </MapboxGL.ShapeSource>
            )}
        </MapboxGL.MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerStart: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.success, // Dùng màu chuẩn từ file colors
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
        zIndex: 2
    },
    markerStop: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#aaa', // Màu mặc định (xám)
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
        zIndex: 1
    },
    markerText: {
        color: 'white', fontWeight: 'bold', fontSize: 12
    },
});

export default RouteDetailMap;