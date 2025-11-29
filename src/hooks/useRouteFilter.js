import { useState, useMemo } from 'react';

// Hàm helper format ngày (để riêng cho gọn)
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const useRouteFilter = (routes) => {
    // State quản lý bộ lọc
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
    const [sortOrder, setSortOrder] = useState('newest');    // newest, oldest

    // Logic lọc và sắp xếp (Memoized)
    const processedRoutes = useMemo(() => {
        let result = [...routes];

        // 1. Tìm kiếm
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(r =>
                r.route_name.toLowerCase().includes(lowerSearch) ||
                (r.start_address && r.start_address.toLowerCase().includes(lowerSearch))
            );
        }

        // 2. Lọc trạng thái
        if (filterStatus !== 'all') {
            result = result.filter(r => r.route_status === filterStatus);
        }

        // 3. Sắp xếp
        result.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [routes, searchText, filterStatus, sortOrder]);

    // Logic nhóm theo ngày (cho SectionList)
    const sections = useMemo(() => {
        const groups = processedRoutes.reduce((acc, route) => {
            const dateKey = formatDate(route.created_at);
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(route);
            return acc;
        }, {});

        return Object.keys(groups).map(date => ({
            title: date,
            data: groups[date]
        }));
    }, [processedRoutes]);

    return {
        searchText, setSearchText,
        filterStatus, setFilterStatus,
        sortOrder, setSortOrder,
        sections, // Dữ liệu cuối cùng đã xử lý xong
    };
};