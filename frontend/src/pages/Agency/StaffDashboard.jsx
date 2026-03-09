import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import StaffStats from '@/components/agency/subAccount/StaffStatistic.jsx';
import StaffActionMenu from '@/components/agency/subAccount/StaffActionMenu.jsx';
import StaffFormModal from '@/components/agency/subAccount/StaffModal.jsx';

const StaffDashboard = () => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });

    // --- Logic Phân Trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Số lượng nhân viên mỗi trang

    const [staffs] = useState([
        { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@agency.com", role: "Nhân viên đặt phòng", used: 2000000, limit: 20000000, status: true, initial: "NV" },
        { id: 2, name: "Trần Thị B", email: "tranthib@agency.com", role: "Nhân viên đặt phòng", used: 18500000, limit: 20000000, status: true, initial: "TH" },
        { id: 3, name: "Lê Đức C", email: "leducc@agency.com", role: "Nhân viên đặt phòng", used: 5200000, limit: 15000000, status: false, initial: "LD" },
        { id: 4, name: "Phạm Hồng D", email: "phamhongd@agency.com", role: "Nhân viên đặt phòng", used: 12800000, limit: 15000000, status: true, initial: "PH" },
        { id: 5, name: "Hoàng Quang E", email: "hoangquange@agency.com", role: "Nhân viên đặt phòng", used: 0, limit: 10000000, status: true, initial: "HQ" },
        { id: 6, name: "Vũ Văn F", email: "vuvanf@agency.com", role: "Nhân viên đặt phòng", used: 1000000, limit: 10000000, status: true, initial: "VF" },
    ]);

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return staffs.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, staffs]);

    const totalPages = Math.ceil(staffs.length / itemsPerPage);

    const openAddModal = () => setModalConfig({ isOpen: true, data: null });
    const openEditModal = (staff) => setModalConfig({ isOpen: true, data: staff });
    const closeModal = () => setModalConfig({ isOpen: false, data: null });

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên & Phân quyền</h1>
                    <button onClick={openAddModal} className="bg-[#006AFF] hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        <Plus size={20} /> Thêm nhân viên mới
                    </button>
                </div>

                <StaffStats />

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] border-b border-slate-50 bg-slate-50/30">
                                <th className="px-8 py-5">Thông tin nhân viên</th>
                                <th className="px-8 py-5">Vai trò</th>
                                <th className="px-8 py-5">Hạn mức chi tiêu ngày</th>
                                <th className="px-8 py-5 text-center">Trạng thái</th>
                                <th className="px-8 py-5 text-right">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {currentTableData.map((staff) => (
                                <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-[#006AFF] font-bold text-[13px]">{staff.initial}</div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-[15px]">{staff.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{staff.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-blue-50 text-[#006AFF] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border border-blue-100">{staff.role}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[11px] font-bold text-slate-600">
                                                {staff.used.toLocaleString()} / <span className="text-slate-400">{staff.limit.toLocaleString()} đ</span>
                                            </p>
                                            <button onClick={() => openEditModal(staff)} className="text-blue-500 hover:text-blue-700"><Edit2 size={12}/></button>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${(staff.used/staff.limit) > 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(staff.used/staff.limit)*100}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <Toggle checked={staff.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <StaffActionMenu onEdit={() => openEditModal(staff)} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Phần Phân Trang --- */}
                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Logic hiển thị rút gọn trang (ví dụ 1, 2, 3... 10) có thể thêm ở đây nếu data lớn
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                        currentPage === pageNumber
                                            ? 'bg-[#006AFF] text-white shadow-md shadow-blue-100'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <StaffFormModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                initialData={modalConfig.data}
            />
        </div>
    );
};

const Toggle = ({ checked }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

export default StaffDashboard;