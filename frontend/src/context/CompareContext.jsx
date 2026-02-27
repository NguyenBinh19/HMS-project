// src/components/agency/booking/compare/CompareContext.jsx
import React, { createContext, useContext, useState } from "react";
// Giả sử bạn dùng thư viện toast để hiển thị thông báo
import { toast } from "react-hot-toast";

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Thêm hoặc gỡ khách sạn khỏi danh sách so sánh
    const toggleCompareItem = (hotel) => {
        setCompareItems((prev) => {
            const isExist = prev.find((item) => item.hotelId === hotel.hotelId);

            if (isExist) {
                // UC021.1: Remove Item
                return prev.filter((item) => item.hotelId !== hotel.hotelId);
            } else {
                // UC021.E1: Exceed Max Items (Tối đa 4)
                if (prev.length >= 4) {
                    toast.error("Bạn chỉ có thể so sánh tối đa 4 khách sạn cùng lúc."); // MSG-WRN-07
                    return prev;
                }
                return [...prev, hotel];
            }
        });
    };

    // UC021.2: Clear All
    const clearAll = () => setCompareItems([]);

    // Mở bảng so sánh
    const handleCompareNow = () => {
        // UC021.E2: Insufficient Items (Cần ít nhất 2)
        if (compareItems.length < 2) {
            toast.error("Vui lòng chọn ít nhất 2 khách sạn để so sánh."); // MSG-INF-02
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <CompareContext.Provider value={{
            compareItems,
            toggleCompareItem,
            clearAll,
            isModalOpen,
            setIsModalOpen,
            handleCompareNow
        }}>
            {children}
        </CompareContext.Provider>
    );
};