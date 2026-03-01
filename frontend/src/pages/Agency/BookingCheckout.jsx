import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseISO, differenceInSeconds, format, differenceInDays } from "date-fns";
import {
    Clock,
    CheckCircle2,
    HelpCircle,
    User,
    CigaretteOff,
    RefreshCw,
    Loader2,
    MapPin,
    Users,
    PhoneCall,
    ShieldCheck,
    Wallet,
    CreditCard
} from "lucide-react";
import { bookingService } from "@/services/booking.service.js";

/* ================= TIMER BAR ================= */
const BookingTimerBar = ({ expiredAt, onExpire, onExtend, isExtending, extendCount, maxExtensions }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiredAt) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = typeof expiredAt === "string" ? parseISO(expiredAt) : expiredAt;
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                clearInterval(interval);
                onExpire();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiredAt, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isLowTime = timeLeft > 0 && timeLeft < 60;

    return (
        <div className={`border-b sticky top-0 z-50 transition-colors ${isLowTime ? 'bg-red-50' : 'bg-white'}`}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                <Clock size={18} className={isLowTime ? "text-red-500 animate-pulse" : "text-orange-500"} />
                <span className="text-sm text-slate-600 font-medium">Phòng và giá tốt đang được giữ trong:</span>
                <span className={`font-bold ${isLowTime ? "text-red-600" : "text-blue-600"}`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Lượt gia hạn: {extendCount}/{maxExtensions}
                    </span>
                    {isLowTime && extendCount < maxExtensions && (
                        <button
                            onClick={onExtend}
                            disabled={isExtending}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                            {isExtending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            GIA HẠN
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN PAGE ================= */
export default function BookingCheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [data, setData] = useState(location.state || {});
    const [isExtending, setIsExtending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");

    // số lần gia hạn (Tối đa 3 lần)
    const [extendCount, setExtendCount] = useState(0);
    const MAX_EXTENSIONS = 3;

    const [customerInfo, setCustomerInfo] = useState({
        name: "", email: "", phone: "", notes: ""
    });
    /* --- VALIDATE Dữ liệu --- */

    // Tên: Không cho phép nhập số
    const handleNameChange = (val) => {
        const regex = /[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]/g;
        const cleanValue = val.replace(regex, "");
        setCustomerInfo({ ...customerInfo, name: cleanValue });
    };

    // Email: Chỉ xóa khoảng trắng
    const handleEmailChange = (val) => {
        setCustomerInfo({ ...customerInfo, email: val.replace(/\s+/g, "") });
    };

    // SĐT: Chỉ nhập số, tối đa 11 số
    const handlePhoneChange = (val) => {
        setCustomerInfo({ ...customerInfo, phone: val.replace(/\D/g, "").slice(0, 11) });
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };

    useEffect(() => {
        if (!data.holdCode) navigate("/");
    }, [data.holdCode, navigate]);

    if (!data.holdCode) return null;

    const checkInDate = parseISO(data.checkInDate);
    const checkOutDate = parseISO(data.checkOutDate);
    const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate));

    const totalRooms = data.selectedRooms?.reduce((sum, r) => sum + r.count, 0) || 0;
    const totalAdults = data.selectedRooms?.reduce((sum, r) => sum + (r.maxAdults * r.count), 0) || 0;
    const totalChildren = data.selectedRooms?.reduce((sum, r) => sum + ((r.maxChildren || 0) * r.count), 0) || 0;

    const finalTotal = data.totalPrice || 0;
    const basePrice = finalTotal / 0.8;
    const discount = basePrice - finalTotal;

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    const handleExpire = () => {
        alert("Phiên giữ chỗ đã hết hạn. Hệ thống sẽ quay về trang tìm kiếm.");
        navigate("/homepage");
    };

    const handleExtendHold = async () => {
        if (extendCount >= MAX_EXTENSIONS) {
            alert("Bạn đã hết lượt gia hạn (tối đa 3 lần). Vui lòng đặt lại phòng từ đầu.");
            navigate("/");
            return;
        }

        setIsExtending(true);
        try {
            const response = await bookingService.extendHold(data.holdCode);
            if (response?.result) {
                setData(prev => ({ ...prev, expiredAt: response.result.expiredAt }));
                setExtendCount(prev => prev + 1);
            }
        } catch (error) {
            alert("Không thể gia hạn vào lúc này. Vui lòng thử lại sau.");
        } finally {
            setIsExtending(false);
        }
    };

    const handleConfirmBooking = async () => {
        const { name, email, phone } = customerInfo;

        if (!name.trim() || !email.trim() || !phone.trim()) return alert("Vui lòng đầy đủ thông tin!");
        if (!validateEmail(email)) return alert("Email không đúng định dạng!");
        if (phone.length < 10) return alert("Số điện thoại phải có ít nhất 10 số!");
        if (!paymentMethod) return alert("Vui lòng chọn nguồn tiền thanh toán!");

        setIsSubmitting(true);
        try {
            const payload = {
                holdCode: data.holdCode,
                // userId: "bf116d64-8e4e-42ee-b9c7-c8e6f2c907a8",
                agencyId: 1,
                guestName: name.trim(),
                guestPhone: phone,
                guestEmail: email,
                notes: customerInfo.notes,
                paymentMethod: paymentMethod
            };
            const response = await bookingService.createBooking(payload);
            if (response?.result) {
                // Gửi đầy đủ thông tin sang trang Success
                navigate("/booking-success", {
                    state: {
                        bookingDetail: {
                            ...response.result,
                            hotelName: data.hotelName,
                            guestName: name.trim(),
                            guestPhone: phone,
                            guestEmail: email,
                            checkInDate: format(checkInDate, "dd/MM/yyyy"),
                            checkOutDate: format(checkOutDate, "dd/MM/yyyy"),
                            totalNights: nights,
                            totalRooms: totalRooms,
                            totalPrice: finalTotal,
                            paymentMethod: paymentMethod
                        }
                    }
                });
            }
        } catch (error) {
            alert(`Lỗi: ${error.response?.data?.message || "Lỗi hệ thống"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] pb-20 font-sans">
            <BookingTimerBar
                expiredAt={data.expiredAt}
                onExpire={handleExpire}
                onExtend={handleExtendHold}
                isExtending={isExtending}
                extendCount={extendCount}
                maxExtensions={MAX_EXTENSIONS}
            />

            <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI (THÔNG TIN KHÁCH & PHÒNG) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Users size={20} className="text-blue-700"/> Thông tin khách
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Tên</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Nguyễn Văn Minh"
                                    value={customerInfo.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Email</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="minh.nguyen@agency.vn"
                                    value={customerInfo.email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Số điện thoại</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="+84 901 234 567"
                                    value={customerInfo.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.selectedRooms?.map((room, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-slate-800">{room.name}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-600 text-[13px] font-medium">
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                        <span>Bao gồm nhận phòng sớm + internet tốc độ cao</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700 text-[13px] font-medium">
                                        <User size={16} />
                                        <span>Khách: <span className="text-slate-500">{room.maxAdults} người lớn</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-[13px] italic pt-2 border-t border-slate-50">
                                        <CigaretteOff size={16} />
                                        <span>Không hút thuốc</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Wallet size={20} className="text-blue-700"/> Chọn nguồn tiền thanh toán
                        </h2>
                        <div className="space-y-4">
                            <label className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === "WALLET" ? "border-blue-500 bg-blue-50/30" : "border-slate-100 hover:bg-slate-50"}`}>
                                <input type="radio" name="payment" className="mt-1.5 w-4 h-4 text-blue-600" checked={paymentMethod === "WALLET"} onChange={() => setPaymentMethod("WALLET")}/>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-pink-100 rounded-lg text-pink-500"><Wallet size={18} /></div>
                                        <span className="font-bold text-slate-700">Ví trả trước (Prepaid Wallet)</span>
                                    </div>
                                </div>
                            </label>
                            <label className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === "CREDIT" ? "border-blue-500 bg-blue-50/30" : "border-slate-100 hover:bg-slate-50"}`}>
                                <input type="radio" name="payment" className="mt-1.5 w-4 h-4 text-blue-600" checked={paymentMethod === "CREDIT"} onChange={() => setPaymentMethod("CREDIT")}/>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><CreditCard size={18} /></div>
                                        <span className="font-bold text-slate-700">Hạn mức Tín dụng (Credit Line)</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI (TÓM TẮT - ĐÃ BỎ STICKY ĐỂ CÓ THỂ CUỘN) */}
                <div className="lg:col-span-1 space-y-4 h-fit">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold mb-4 text-slate-800 border-b pb-2 uppercase text-xs tracking-wider">Tóm tắt đặt phòng</h3>
                        <div className="text-blue-600 font-black text-base mb-1 leading-tight">{data.hotelName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mb-4 italic font-medium">
                            <MapPin size={12}/> {data.address}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <div className="text-[10px] uppercase text-slate-400 font-black mb-1">Nhận phòng</div>
                                <div className="font-bold text-slate-700">{format(checkInDate, "dd/MM/yyyy")}</div>
                                <div className="text-[11px] text-slate-500 font-bold italic">Từ {data.checkInTime || "14:00"}</div>
                            </div>
                            <div className="border-l border-slate-200 pl-4">
                                <div className="text-[10px] uppercase text-slate-400 font-black mb-1">Trả phòng</div>
                                <div className="font-bold text-slate-700">{format(checkOutDate, "dd/MM/yyyy")}</div>
                                <div className="text-[11px] text-slate-500 font-bold italic">Trước {data.checkOutTime || "12:00"}</div>
                            </div>
                        </div>

                        <div className="mb-6 px-1 space-y-1.5">
                            <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                <Clock size={14} className="text-blue-500" />
                                <span>Lưu trú: <strong>{nights} đêm</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                <Users size={14} className="text-blue-500" />
                                <span>Phòng: <strong>{totalRooms} phòng</strong></span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 font-bold">Ưu đãi Agency</span>
                                <span className="text-emerald-600 font-bold">-{formatCurrency(discount)}</span>
                            </div>
                            <div className="bg-blue-600 mt-4 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                                <span className="text-[10px] font-black uppercase opacity-80">Tổng cộng</span>
                                <span className="text-xl font-black">{formatCurrency(finalTotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={isSubmitting}
                            className="w-full mt-4 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-lg uppercase tracking-wider text-sm flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "XÁC NHẬN ĐẶT PHÒNG"}
                        </button>
                    </div>

                    {/* GIỮ CHỖ AN TOÀN */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-400 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck size={20} />
                            <h4 className="font-bold text-[15px]">Giữ chỗ an toàn</h4>
                        </div>
                        <p className="text-[12.5px] leading-relaxed opacity-90">
                            Phòng được giữ trong 15 phút. Gia hạn tối đa 3 lần nếu bạn cần thêm thời gian.
                        </p>
                    </div>

                    {/* HỖ TRỢ 24/7 */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="font-bold text-slate-800 text-[15px]">Hỗ trợ 24/7</h4>
                        <div className="flex items-center gap-2 text-blue-700 font-black">
                            <PhoneCall size={18} />
                            <span className="text-base">1900 1234</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}