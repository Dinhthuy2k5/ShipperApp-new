import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors';

const AddressAutocomplete = ({
    placeholder,
    value,
    onSelect, // Hàm callback khi chọn địa chỉ: (addressText) => void
    containerStyle,
    referenceLat,
    referenceLng
}) => {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounce: Chỉ gọi API khi ngừng gõ 500ms (tránh spam server)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2 && showResults) {
                searchPlaces(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const searchPlaces = async (text) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            // Chuẩn bị tham số gửi lên Backend
            const params = { q: text };

            // Nếu có tọa độ tham chiếu thì gửi kèm để ưu tiên tìm quanh đó
            if (referenceLat && referenceLng) {
                params.userLat = referenceLat;
                params.userLng = referenceLng;
                console.log("Đang tìm kiếm quanh:", referenceLat, referenceLng);
            }

            const res = await axios.get(`http://10.0.2.2:3000/api/routes/search`, {
                params: params, // Truyền params vào đây
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (error) {
            console.log('Lỗi search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        setQuery(item.name);       // Điền tên vào ô input
        setShowResults(false);     // Ẩn danh sách
        if (onSelect) {
            onSelect(item.name);   // Trả kết quả ra ngoài
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setShowResults(true);
                        if (onSelect) onSelect(text); // 3. Gửi ngay dữ liệu ra bên ngoài cho cha
                    }}
                />
                {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />}
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(''); setShowResults(false); }}>
                        <Icon name="close-circle" size={20} color="#ccc" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Danh sách gợi ý */}
            {showResults && results.length > 0 && (
                <View style={styles.resultsList}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {results.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.resultItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Icon name="location-outline" size={18} color="#666" style={{ marginRight: 10 }} />
                                <Text style={styles.resultText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10, // Quan trọng để nổi lên trên
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    loader: {
        marginRight: 10,
    },
    resultsList: {
        position: 'absolute', // Nổi lên trên các thành phần khác
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxHeight: 200,
        zIndex: 999,
    },
    resultItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
});

export default AddressAutocomplete;