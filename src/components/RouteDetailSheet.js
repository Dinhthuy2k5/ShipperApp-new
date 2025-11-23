import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Animated, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { COLORS } from '../utils/colors'; // Import bộ màu

const { height } = Dimensions.get('window');

const RouteDetailSheet = ({
    routeDetails, isCompleted, newStopAddress, setNewStopAddress,
    handleAddStop, handleDeleteStop, handleUpdateStopStatus, handleManualCompleteRoute, handleOptimizeRoute
}) => {
    const draggableRange = { top: height * 0.85, bottom: 140 }; // Tăng chiều cao kéo lên

    const renderStopItem = (item, index) => (
        <View key={item.id} style={styles.stopItem}>
            {/* Số thứ tự */}
            <View style={[
                styles.stopOrderContainer,
                item.optimized_order && { backgroundColor: COLORS.primary }
            ]}>
                <Text style={styles.stopOrder}>
                    {item.optimized_order || '-'}
                </Text>
            </View>

            {/* Nội dung điểm dừng */}
            <TouchableOpacity
                style={styles.stopDetails}
                disabled={isCompleted}
                onPress={() => handleUpdateStopStatus(item.id, item.stop_status)}
            >
                <Text style={styles.stopAddress}>{item.address_text}</Text>

                {/* Badge trạng thái nhỏ */}
                <View style={[
                    styles.statusBadgeSmall,
                    item.stop_status === 'delivered' ? { backgroundColor: COLORS.success } :
                        (item.stop_status === 'failed' ? { backgroundColor: COLORS.danger } : { backgroundColor: '#E5E5EA' })
                ]}>
                    <Text style={[
                        styles.statusBadgeSmallText,
                        item.stop_status === 'pending' && { color: '#555' } // Chữ đậm hơn cho pending
                    ]}>
                        {item.stop_status === 'delivered' ? 'Đã giao' : (item.stop_status === 'failed' ? 'Thất bại' : 'Đang chờ')}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Nút Xóa */}
            {!isCompleted && (
                <TouchableOpacity onPress={() => handleDeleteStop(item.id)} style={styles.deleteButton}>
                    <Icon name="trash-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SlidingUpPanel
            ref={c => this._panel = c}
            draggableRange={draggableRange}
            animatedValue={new Animated.Value(120)}
            showBackdrop={false}
            snappingPoints={[380]}
            height={height * 0.85}
            friction={0.5}
        >
            <View style={styles.panel}>
                {/* Tay nắm */}
                <View style={styles.panelHandle}>
                    <View style={styles.handleBar} />
                </View>

                <ScrollView style={styles.panelContent} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{routeDetails?.route_name}</Text>

                        {/* Điểm xuất phát */}
                        <View style={styles.infoRow}>
                            <Icon name="navigate-circle" size={20} color={COLORS.success} />
                            <Text style={styles.infoLabel}>Xuất phát:</Text>
                            <Text style={styles.infoText} numberOfLines={1}>
                                {routeDetails?.start_address || "Chưa cập nhật"}
                            </Text>
                        </View>

                        {/* Thông tin KM/Phút */}
                        {routeDetails?.total_distance_meters ? (
                            <View style={styles.infoRow}>
                                <Icon name="speedometer-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.infoText}>
                                    {(routeDetails.total_distance_meters / 1000).toFixed(1)} km • {Math.round(routeDetails.total_duration_seconds / 60)} phút
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.infoPending}>Lộ trình chưa được tối ưu hóa</Text>
                        )}

                        {/* Nút TỐI ƯU HÓA (Thiết kế mới) */}
                        {!isCompleted && routeDetails?.stops?.length > 0 && (
                            <TouchableOpacity
                                style={[
                                    styles.optimizeButton,
                                    routeDetails?.overview_polyline && { backgroundColor: COLORS.secondary }
                                ]}
                                onPress={handleOptimizeRoute}
                                activeOpacity={0.8}
                            >
                                <Icon name="flash" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.optimizeButtonText}>
                                    {routeDetails?.overview_polyline ? "Tối ưu lại (Cập nhật)" : "TỐI ƯU NGAY"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* FORM THÊM */}
                    {!isCompleted && (
                        <View style={styles.addForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Thêm điểm dừng mới..."
                                placeholderTextColor="#999"
                                value={newStopAddress}
                                onChangeText={setNewStopAddress}
                                autoCorrect={false}
                                autoComplete="off"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleAddStop}>
                                <Icon name="add" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* DANH SÁCH */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listLabel}>Danh sách điểm dừng ({routeDetails?.stops?.length || 0})</Text>
                    </View>

                    {routeDetails?.stops?.map((item, index) => renderStopItem(item, index))}

                    {/* FOOTER */}
                    {!isCompleted && routeDetails?.stops?.length > 0 && (
                        <TouchableOpacity style={styles.completeButton} onPress={handleManualCompleteRoute}>
                            <Icon name="checkmark-done-circle" size={24} color="#fff" />
                            <Text style={styles.completeButtonText}>HOÀN THÀNH LỘ TRÌNH</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        </SlidingUpPanel>
    );
};

const styles = StyleSheet.create({
    panel: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    panelHandle: {
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handleBar: {
        width: 50,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#DDDDDD',
    },
    panelContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textMain,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoLabel: {
        fontWeight: '600',
        color: COLORS.textSub,
        marginLeft: 6,
        marginRight: 4,
    },
    infoText: {
        color: COLORS.textMain,
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    infoPending: {
        color: COLORS.warning,
        fontStyle: 'italic',
        fontSize: 14,
        marginTop: 5,
    },
    // Nút Tối Ưu Mới (Đẹp hơn)
    optimizeButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary, // Xanh dương đậm
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6, // Đổ bóng Android
    },
    optimizeButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    addForm: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#F7F7F9',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: COLORS.textMain,
        marginRight: 10,
    },
    addButton: {
        width: 50,
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 3,
    },
    listHeader: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 5,
    },
    listLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    stopOrderContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#D1D1D6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stopOrder: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    stopDetails: {
        flex: 1,
    },
    stopAddress: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 6,
        lineHeight: 22,
    },
    statusBadgeSmall: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    statusBadgeSmallText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    deleteButton: {
        padding: 10,
    },
    completeButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.success,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    completeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});

export default RouteDetailSheet;