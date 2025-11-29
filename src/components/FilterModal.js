import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../utils/colors';

const FilterModal = ({
    visible,
    onClose,
    filterStatus,
    setFilterStatus,
    sortOrder,
    setSortOrder
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Bộ lọc & Sắp xếp</Text>

                    {/* --- Trạng thái --- */}
                    <Text style={styles.filterLabel}>Trạng thái:</Text>
                    <View style={styles.filterRow}>
                        {['all', 'pending', 'completed'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.filterOption, filterStatus === status && styles.filterOptionActive]}
                                onPress={() => setFilterStatus(status)}
                            >
                                <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
                                    {status === 'all' ? 'Tất cả' : (status === 'pending' ? 'Đang chờ' : 'Hoàn thành')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* --- Sắp xếp --- */}
                    <Text style={styles.filterLabel}>Thời gian:</Text>
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[styles.filterOption, sortOrder === 'newest' && styles.filterOptionActive]}
                            onPress={() => setSortOrder('newest')}
                        >
                            <Text style={[styles.filterText, sortOrder === 'newest' && styles.filterTextActive]}>Mới nhất</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterOption, sortOrder === 'oldest' && styles.filterOptionActive]}
                            onPress={() => setSortOrder('oldest')}
                        >
                            <Text style={[styles.filterText, sortOrder === 'oldest' && styles.filterTextActive]}>Cũ nhất</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nút đóng */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: COLORS.textMain },
    filterLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 10, marginBottom: 8 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    filterOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
    filterOptionActive: { borderColor: COLORS.primary, backgroundColor: '#EDF2FA' },
    filterText: { fontSize: 13, color: '#666' },
    filterTextActive: { color: COLORS.primary, fontWeight: '700' },
    closeButton: { marginTop: 20, backgroundColor: COLORS.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
    closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default FilterModal;