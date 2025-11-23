import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { decodePolyline, getBounds } from '../utils/mapUtils';
import { COLORS } from '../utils/colors';
import { MAPBOX_ACCESS_TOKEN } from '../utils/config';

// --- QUAN TRỌNG: DÁN TOKEN CỦA BẠN VÀO ĐÂY ---
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const RouteDetailMap = ({ routeDetails }) => {
    const cameraRef = useRef(null);

    useEffect(() => {
        if (cameraRef.current && routeDetails && routeDetails.start_lat && routeDetails.start_lng) {
            const validStops = routeDetails.stops.filter(stop => stop.lat && stop.lng);
            const stopsCoords = validStops.map(stop => [stop.lng, stop.lat]);
            const allCoords = [[routeDetails.start_lng, routeDetails.start_lat], ...stopsCoords];

            cameraRef.current.fitBounds(
                getBounds(allCoords)[0], getBounds(allCoords)[1], 50, 1000
            );
        }
    }, [routeDetails]);

    return (
        <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
            <MapboxGL.Camera
                ref={cameraRef}
                defaultSettings={{
                    centerCoordinate: [105.8522, 21.0285],
                    zoomLevel: 12, // Tăng mức zoom mặc định (10 -> 14)
                }}
            />

            {/* Điểm bắt đầu */}
            {routeDetails?.start_lat && routeDetails?.start_lng && (
                <MapboxGL.PointAnnotation
                    id="startPoint"
                    coordinate={[routeDetails.start_lng, routeDetails.start_lat]}
                >
                    <View style={styles.markerStart}><Icon name="navigate" size={20} color="#fff" /></View>
                </MapboxGL.PointAnnotation>
            )}

            {/* Các điểm dừng */}
            {routeDetails?.stops?.map((stop) => {
                if (!stop.lat || !stop.lng) return null;
                return (
                    <MapboxGL.PointAnnotation key={stop.id} id={stop.id.toString()} coordinate={[stop.lng, stop.lat]}>
                        <View style={[styles.markerStop, stop.optimized_order && { backgroundColor: '#007AFF' }]}>
                            <Icon name="location" size={16} color="#fff" />
                        </View>
                    </MapboxGL.PointAnnotation>
                );
            })}

            {/* Đường đi */}
            {routeDetails?.overview_polyline && (
                <MapboxGL.ShapeSource id="routeSource" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: decodePolyline(routeDetails.overview_polyline) } }}>
                    <MapboxGL.LineLayer id="routeLine" style={{ lineColor: '#007AFF', lineWidth: 4 }} />
                </MapboxGL.ShapeSource>
            )}
        </MapboxGL.MapView>
    );
};

const styles = StyleSheet.create({
    map: { ...StyleSheet.absoluteFillObject },
    markerStart: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    markerStop: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
});

export default RouteDetailMap;