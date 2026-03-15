import { Plus, ChevronLeft, ChevronRight, Loader2, CreditCard } from 'lucide-react';
import StaffStats from '@/components/agency/subAccount/StaffStatistic.jsx';
import StaffActionMenu from '@/components/agency/subAccount/StaffActionMenu.jsx';
import StaffFormModal from '@/components/agency/subAccount/StaffModal.jsx';
import StaffCreateModal from "@/components/agency/subAccount/StaffCreateModal.jsx";
import React, { useState, useMemo, useEffect } from 'react';
import { staffService } from '@/services/staff.service.js';

const StaffDashboard = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        data: null,
        isViewOnly: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchStaffList = async () => {
        try {
            setLoading(true);
            const response = await staffService.getStaffList();
            // Lọc các tài khoản thuộc Agency
            const agencyStaff = (response.result || []).filter(s =>
                s.permission === 'AGENCY_STAFF' || s.permission === 'AGENCY_MANAGER'
            );
            setStaffs(agencyStaff);
        } catch (error) {
            console.error("Lỗi khi tải danh sách Agency:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaffList(); }, []);

    const handleAddStaff = () => setIsCreateOpen(true);

    const handleEditStaff = (staff) => {
        setModalConfig({ isOpen: true, data: staff, isViewOnly: false });
    };

    const handleViewDetails = (staff) => {
        setModalConfig({ isOpen: true, data: staff, isViewOnly: true });
    };

    const handleToggleStatus = async (staff) => {
        const actionText = staff.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;
        try {
            if (staff.status === 'ACTIVE') {
                await staffService.lockStaff(staff.id);
            } else {
                await staffService.unLockStaff(staff.id);
            }
            fetchStaffList();
        } catch (error) {
            alert(`Lỗi khi ${actionText} tài khoản`);
        }
    };

    const currentTableData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return staffs.slice(start, start + itemsPerPage);
    }, [currentPage, staffs]);

    const totalPages = Math.max(1, Math.ceil(staffs.length / itemsPerPage));

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên Đại lý</h1>
                    <button
                        onClick={handleAddStaff}
                        className="bg-[#006AFF] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Thêm nhân sự
                    </button>
                </div>

                {/* Thống kê cho Agency (Tổng hạn mức, số tiền đã dùng) */}
                <StaffStats data={staffs} />

                {/* Table */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/30 border-b border-slate-50">
                            <tr className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-8 py-5">Nhân viên</th>
                                <th className="px-8 py-5">Vai trò</th>
                                <th className="px-8 py-5">Thông tin cá nhân</th>
                                <th className="px-8 py-5 text-center">Trạng thái</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : staffs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-20 text-slate-400">Chưa có nhân viên đại lý nào.</td></tr>
                            ) : currentTableData.map((staff) => (
                                <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#006AFF] font-bold uppercase">
                                                {(staff.lastName?.[0] || staff.username?.[0] || 'A')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {staff.lastName || staff.firstName
                                                        ? `${staff.lastName || ''} ${staff.firstName || ''}`.trim()
                                                        : staff.username}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">{staff.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                                            staff.permission === 'AGENCY_MANAGER'
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                : 'bg-blue-50 text-[#006AFF] border-blue-100'
                                        }`}>
                                            {staff.permission === 'AGENCY_MANAGER' ? 'QUẢN LÝ' : 'NHÂN VIÊN'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-600 font-medium">{staff.phone || 'Chưa có SĐT'}</p>
                                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                            {staff.address || 'Chưa có địa chỉ'}
                                        </p>
                                        {staff.dob && <p className="text-[10px] text-slate-400">NS: {staff.dob}</p>}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Toggle checked={staff.status === 'ACTIVE'}
                                                    onChange={() => handleToggleStatus(staff)}/>
                                            <span
                                                className={`text-[9px] font-bold uppercase ${staff.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <StaffActionMenu
                                            onEdit={() => handleEditStaff(staff)}
                                            onToggle={() => handleToggleStatus(staff)}
                                            onViewDetails={() => handleViewDetails(staff)}
                                            onViewHistory={() => alert(`Lịch sử giao dịch: ${staff.username}`)}
                                            status={staff.status}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân Trang */}
                    <div
                        className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                    currentPage === index + 1
                                        ? 'bg-[#006AFF] text-white shadow-md'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <StaffFormModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                initialData={modalConfig.data}
                isViewOnly={modalConfig.isViewOnly}
                onSuccess={fetchStaffList}
            />
            <StaffCreateModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchStaffList}
            />
        </div>
    );
};

const Toggle = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full transition-colors"></div>
    </label>
);

export default StaffDashboard;