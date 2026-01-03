// File: src/components/RouteDetailMap.js

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { decodePolyline, getBounds } from '../utils/mapUtils';
import { COLORS } from '../utils/colors';

import { MAPBOX_ACCESS_TOKEN } from '../utils/config';
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Sử dụng isNavigationMode để quyết định có hiện traffic hay không
const RouteDetailMap = ({ routeDetails, isNavigationMode }) => {
    const cameraRef = useRef(null);
    // Biến này để điều khiển việc hiện lớp giao thông.
    // Bạn có thể tách ra thành một prop riêng nếu muốn nút bật/tắt riêng.
    const showTrafficLayer = true;

    useEffect(() => {
        if (!isNavigationMode && cameraRef.current && routeDetails && routeDetails.start_lat) {
            const validStops = routeDetails.stops.filter(stop => stop.lat && stop.lng);
            const stopsCoords = validStops.map(stop => [stop.lng, stop.lat]);
            const allCoords = [[routeDetails.start_lng, routeDetails.start_lat], ...stopsCoords];

            if (allCoords.length > 1) {
                cameraRef.current.fitBounds(
                    getBounds(allCoords)[0],
                    getBounds(allCoords)[1],
                    50,
                    1000
                );
            }

        }
    }, [routeDetails, isNavigationMode]);

    return (
        <MapboxGL.MapView
            style={styles.map}
            // StyleURL.Street hoặc StyleURL.TrafficDay đều được.
            // TrafficDay thì nó làm mờ các tòa nhà đi để nổi bật đường hơn.
            styleURL={MapboxGL.StyleURL.TrafficDay}
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
                followUserLocation={isNavigationMode}
                followUserMode={isNavigationMode ? 'course' : 'normal'}
                followZoomLevel={16}
                followPitch={isNavigationMode ? 45 : 0}
            />

            <MapboxGL.UserLocation
                visible={isNavigationMode}
                animated={true}
                showsUserHeadingIndicator={true}
                androidRenderMode="gps"
            />

            {/* ================================================================== */}
            {/* --- THÊM LỚP GIAO THÔNG THỜI GIAN THỰC TẠI ĐÂY (REAL-TIME TRAFFIC) --- */}
            {/* ================================================================== */}
            {showTrafficLayer && (
                <MapboxGL.VectorSource id="mapbox-traffic" url="mapbox://mapbox.mapbox-traffic-v1">
                    {/* 1. Tắc nghẽn nghiêm trọng (Đỏ đậm) */}
                    <MapboxGL.LineLayer
                        id="traffic-severe"
                        sourceLayer="traffic"
                        filter={['==', 'congestion', 'severe']}
                        style={{ lineColor: '#8b0000', lineWidth: 3, lineOpacity: 0.7 }}
                        belowLayerID="routeLine" // Đảm bảo nằm dưới đường lộ trình chính
                    />
                    {/* 2. Tắc đường (Đỏ) */}
                    <MapboxGL.LineLayer
                        id="traffic-heavy"
                        sourceLayer="traffic"
                        filter={['==', 'congestion', 'heavy']}
                        style={{ lineColor: 'red', lineWidth: 3, lineOpacity: 0.7 }}
                        belowLayerID="routeLine"
                    />
                    {/* 3. Đông đúc (Vàng/Cam) */}
                    <MapboxGL.LineLayer
                        id="traffic-moderate"
                        sourceLayer="traffic"
                        filter={['==', 'congestion', 'moderate']}
                        style={{ lineColor: 'orange', lineWidth: 3, lineOpacity: 0.7 }}
                        belowLayerID="routeLine"
                    />
                    {/* 4. Thông thoáng (Xanh lá) - Thường mapbox ít hiện cái này để đỡ rối */}
                    <MapboxGL.LineLayer
                        id="traffic-low"
                        sourceLayer="traffic"
                        filter={['==', 'congestion', 'low']}
                        style={{ lineColor: 'green', lineWidth: 2, lineOpacity: 0.5 }}
                        belowLayerID="routeLine"
                    />
                </MapboxGL.VectorSource>
            )}
            {/* ================================================================== */}


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
                            stop.optimized_order && { backgroundColor: COLORS.primary },
                            stop.stop_status === 'delivered' && { backgroundColor: COLORS.success }
                        ]}>
                            <Text style={styles.markerText}>{stop.optimized_order || '!'}</Text>
                        </View>
                    </MapboxGL.PointAnnotation>
                );
            })}

            {/* 3. Đường đi chính của Shipper (Vẫn giữ màu xanh chủ đạo) */}
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
                        // Giảm độ đậm và độ mờ đi một chút để nhìn thấy giao thông bên dưới
                        style={{ lineColor: COLORS.primary, lineWidth: 6, lineOpacity: 0.6, lineCap: 'round' }}
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
        backgroundColor: COLORS.success,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
        zIndex: 2
    },
    markerStop: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#aaa',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
        zIndex: 1
    },
    markerText: {
        color: 'white', fontWeight: 'bold', fontSize: 12
    },
});

export default RouteDetailMap;