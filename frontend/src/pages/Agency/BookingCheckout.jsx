import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseISO, differenceInSeconds, format, differenceInDays } from "date-fns";
import {
    Clock, CheckCircle2, User, CigaretteOff, RefreshCw, Loader2,
    MapPin, Users, ShieldCheck, Wallet, CreditCard,
    Tag, XCircle, ChevronRight, AlertCircle, PhoneCall
} from "lucide-react";
import { bookingService } from "@/services/booking.service.js";
import { useBookingPromotion } from "@/components/agency/booking/useBookingPromotion.js";
import { addonServiceApi } from "@/services/addonService.service.js";
import ExtraServiceSection from "@/components/agency/booking/ExtraServiceSection.jsx";

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

    // UC-026 - Dịch vụ thêm
    const [selectedAddons, setSelectedAddons] = useState([]);

    // số lần gia hạn (Tối đa 3 lần)
    const [extendCount, setExtendCount] = useState(0);
    const MAX_EXTENSIONS = 3;
    const [isAgreed, setIsAgreed] = useState(false);

    const [customerInfo, setCustomerInfo] = useState({
        name: "", email: "", phone: "", notes: ""
    });

    // SỬ DỤNG CUSTOM HOOK LOGIC VOUCHER
    const {
        promoCode, setPromoCode, promoData, isCheckingPromo, promoError,
        showWallet, setShowWallet, availableCoupons, fetchWalletCoupons,
        handleApplyCoupon, handleRemoveCoupon, discountAmount, finalPrice
    } = useBookingPromotion(data, navigate);

    useEffect(() => {
        if (!data.holdCode) {
            navigate("/");
            return;
        }
        fetchWalletCoupons();
    }, [data.holdCode]);

    /* --- VALIDATE Logic --- */
    const handleNameChange = (val) => {
        const regex = /[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]/g;
        setCustomerInfo({ ...customerInfo, name: val.replace(regex, "") });
    };
    const handleEmailChange = (val) => setCustomerInfo({ ...customerInfo, email: val.replace(/\s+/g, "") });
    const handlePhoneChange = (val) => setCustomerInfo({ ...customerInfo, phone: val.replace(/\D/g, "").slice(0, 11) });
    const validateEmail = (email) => String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    if (!data.holdCode) return null;

    const checkInDate = parseISO(data.checkInDate);
    const checkOutDate = parseISO(data.checkOutDate);
    const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate));
    const totalRooms = data.selectedRooms?.reduce((sum, r) => sum + r.count, 0) || 0;
    const totalAdults = data.selectedRooms?.reduce((sum, r) => sum + (r.maxAdults * r.count), 0) || 0;
    const totalChildren = data.selectedRooms?.reduce((sum, r) => sum + ((r.maxChildren || 0) * r.count), 0) || 0;

    const roomPrice = data.totalPrice || 0;

    // ưu đãi agency (20%)
    const basePrice = roomPrice / 0.8;
    const agencyDiscount = basePrice - roomPrice;

    // dịch vụ thêm
    const addonsTotal = selectedAddons.reduce(
        (sum, s) => sum + (s.quantity || 1) * (s.netPrice || 0),
        0
    );

    // voucher
    const promoDiscount = discountAmount || 0;

    // tổng cuối
    const grandTotal = roomPrice + addonsTotal - promoDiscount;

    const handleExpire = () => {
        alert("Phiên giữ chỗ đã hết hạn. Hệ thống sẽ quay về trang tìm kiếm.");
        navigate("/homepage");
    };

    const handleExtendHold = async () => {
        if (extendCount >= MAX_EXTENSIONS) return alert("Hết lượt gia hạn.");
        setIsExtending(true);
        try {
            const response = await bookingService.extendHold(data.holdCode);
            if (response?.result) {
                setData(prev => ({ ...prev, expiredAt: response.result.expiredAt }));
                setExtendCount(prev => prev + 1);
            }
        } catch (error) { alert("Lỗi gia hạn."); } finally { setIsExtending(false); }
    };

    const handleConfirmBooking = async () => {
        const { name, email, phone } = customerInfo;
        if (!name.trim() || !email.trim() || !phone.trim() || !paymentMethod) return alert("Vui lòng điền đủ thông tin!");
        if (!isAgreed) {
            return alert("Bạn cần đồng ý với Quy tắc đặt phòng & Chính sách hủy để tiếp tục!");
        }
        if (!validateEmail(email)) return alert("Email sai định dạng!");
        if (phone.length < 10) return alert("Số điện thoại không hợp lệ!");

        setIsSubmitting(true);
        try {
            const payload = {
                holdCode: data.holdCode,
                // agencyId: 1,
                guestName: name.trim(),
                guestPhone: phone.trim(),
                guestEmail: email.trim(),
                notes: customerInfo.notes || "",
                paymentMethod: paymentMethod,
                totalGuests: data.selectedRooms?.reduce((sum, r) => sum + (Number(r.maxAdults || 0) * Number(r.count || 0)), 0) || 1,
                discountTotal: Number(discountAmount || 0),
                promotionCode: promoData?.code ? String(promoData.code) : null
            };
            const response = await bookingService.createBooking(payload);
            if (response?.result) {
                // UC-026: Lưu dịch vụ thêm nếu có
                if (selectedAddons.length > 0) {
                    try {
                        const addonPayload = selectedAddons.map(({ netPrice, ...rest }) => rest);
                        await addonServiceApi.addServicesToBooking({
                            bookingId: response.result.bookingId,
                            services: addonPayload,
                        });
                    } catch (addonErr) {
                        console.warn("Lưu dịch vụ thêm thất bại:", addonErr);
                    }
                }
                // Gửi đầy đủ thông tin sang trang Success
                navigate("/booking-success", {
                    state: {
                        booking: response.result,
                        checkoutData: {
                            hotelName: data.hotelName,
                            hotelImage: data.hotelImage,
                            totalPrice: grandTotal,
                            guestName: name.trim(),
                            guestPhone: phone,
                            guestEmail: email,
                            checkInDate: format(checkInDate, "dd/MM/yyyy"),
                            checkOutDate: format(checkOutDate, "dd/MM/yyyy"),
                            totalNights: nights,
                            totalRooms: totalRooms,
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
                onExpire={() => navigate("/search-hotel")}
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
                            <Users size={20} className="text-blue-700" /> Thông tin khách
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Tên khách hàng</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.name} placeholder="Nguyễn Văn A"
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Email nhận vé</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.email} placeholder="example@gmail.com"
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Số điện thoại</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.phone} placeholder="09xx xxx xxx"
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.selectedRooms?.map((room, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-slate-800">{room.name} x {room.count}</h3>
                                <div className="flex flex-wrap gap-y-3 gap-x-6 text-[13px]">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Users size={16} className="text-blue-600" />
                                        <span className="font-medium">Tối đa: {room.maxAdults} người lớn {room.maxChildren > 0 && `& ${room.maxChildren} trẻ em`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                        <CheckCircle2 size={16} /><span>Bao gồm Internet & Phí dịch vụ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <CigaretteOff size={16} /><span>Không hút thuốc</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* UC-026 - Dịch vụ thêm */}
                    <ExtraServiceSection
                        hotelId={data.hotelId}
                        onChange={setSelectedAddons}
                    />

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <CreditCard size={20} className="text-blue-700" /> Chọn nguồn tiền thanh toán
                        </h2>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "WALLET" ? "border-blue-500 bg-blue-50/30" : "border-slate-100"}`}>
                                <input type="radio" className="w-5 h-5 accent-blue-600" checked={paymentMethod === "WALLET"} onChange={() => setPaymentMethod("WALLET")} />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500"><Wallet size={20} /></div>
                                    <div>
                                        <span className="font-bold text-slate-800 text-[15px]">Ví trả trước (Prepaid Wallet)</span>
                                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán ngay lập tức bằng số dư ví</p>
                                    </div>
                                </div>
                            </label>
                            <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "CREDIT" ? "border-blue-500 bg-blue-50/30" : "border-slate-100"}`}>
                                <input type="radio" className="w-5 h-5 accent-blue-600" checked={paymentMethod === "CREDIT"} onChange={() => setPaymentMethod("CREDIT")} />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><CreditCard size={20} /></div>
                                    <div>
                                        <span className="font-bold text-slate-800 text-[15px]">Hạn mức Tín dụng (Credit Line)</span>
                                        <p className="text-xs text-slate-500 mt-0.5">Sử dụng hạn mức tín dụng được cấp</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT THANH TOÁN  */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            {/* Banner khách sạn */}
                            <div className="relative h-24 flex items-end p-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10" />
                                <img src={data.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=500"} className="absolute inset-0 w-full h-full object-cover" alt="hotel" />
                                <div className="relative z-20 text-white">
                                    <h3 className="font-bold text-[15px] leading-tight">{data.hotelName}</h3>
                                    <p className="text-[11px] opacity-80 mt-1">{format(checkInDate, "dd/MM/yyyy")} - {format(checkOutDate, "dd/MM/yyyy")}</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Tiền phòng ({nights} đêm)</span>
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(roomPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">

                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Thuế & Phí</span>
                                        <span className="text-emerald-600 font-medium italic text-xs">Đã bao gồm</span>
                                    </div>
                                </div>

                                {/* BOX VOUCHER TÍCH HỢP LOGIC */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[11px] font-black text-slate-800 uppercase">Mã giảm giá</label>
                                        <button onClick={() => setShowWallet(!showWallet)} className="text-[10px] font-bold text-blue-600 hover:underline">
                                            {showWallet ? "Đóng ví" : "Chọn từ ví"}
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                className={`w-full border ${promoError ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 rounded-xl text-sm outline-none uppercase font-bold`}
                                                placeholder="Nhập mã"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                disabled={!!promoData}
                                            />
                                            {isCheckingPromo && <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-slate-400" />}
                                        </div>
                                        <button
                                            onClick={() => promoData ? handleRemoveCoupon() : handleApplyCoupon()}
                                            className={`px-4 rounded-xl text-xs font-bold transition-all ${promoData ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {promoData ? "Bỏ" : "Áp dụng"}
                                        </button>
                                    </div>

                                    {/* Dropdown ví voucher */}
                                    {showWallet && (
                                        <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y z-50 relative">
                                            {availableCoupons.length > 0 ? availableCoupons.map((cp) => (
                                                <div key={cp.id} onClick={() => handleApplyCoupon(cp.code)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700">{cp.code}</div>
                                                        <div className="text-[10px] text-slate-500">Giảm {cp.typeDiscount === "PERCENT" ? `${cp.discountVal}%` : formatCurrency(cp.discountVal)}</div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300" />
                                                </div>
                                            )) : <div className="p-4 text-[11px] text-slate-400 text-center italic">Không có mã khả dụng</div>}
                                        </div>
                                    )}

                                    {promoError && <div className="mt-2 flex items-center gap-1 text-red-500 text-[10px] font-bold italic"><AlertCircle size={12} /> {promoError}</div>}
                                    {promoData && <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[10px] font-bold italic"><CheckCircle2 size={12} /> Giảm thành công: -{formatCurrency(discountAmount)}</div>}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-900">Giá phòng cuối cùng:</span>
                                    <span className="text-xl font-black text-purple-600 leading-none">{formatCurrency(finalPrice)}</span>
                                </div>

                                {/* CHECKBOX ĐIỀU KHOẢN */}

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600 font-bold">Ưu đãi Agency</span>
                                        <span className="text-emerald-600 font-bold">-{formatCurrency(agencyDiscount)}</span>
                                    </div>
                                    {addonsTotal > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 font-bold">Dịch vụ thêm</span>
                                            <span className="text-slate-800 font-bold">+{formatCurrency(addonsTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 pt-2">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                                checked={isAgreed}
                                                onChange={(e) => setIsAgreed(e.target.checked)}
                                            />
                                        </div>
                                        <label htmlFor="terms" className="text-[12px] text-slate-600 leading-tight cursor-pointer select-none">
                                            Tôi đồng ý với <span className="text-blue-600 font-bold hover:underline">Quy tắc đặt phòng</span> & <span className="text-blue-600 font-bold hover:underline">Chính sách hủy</span> của hệ thống.
                                        </label>
                                    </div>
                                    <div className="bg-blue-600 mt-4 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                                        <span className="text-[10px] font-black uppercase opacity-80">Tổng cộng</span>
                                        <span className="text-xl font-black">{formatCurrency(grandTotal)}</span>
                                    </div>

                                </div>

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[#1a73e8] hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={18} /> ĐẶT NGAY</>}
                                </button>
                            </div>
                        </div>

                        {/* BOX GIỮ CHỖ AN TOÀN  */}
                        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} /></div>
                            <h4 className="font-bold text-[15px] mb-1 flex items-center gap-2"><ShieldCheck size={18} /> Giữ chỗ an toàn</h4>
                            <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                Hệ thống đang giữ giá tốt nhất cho bạn. Vui lòng thanh toán trước khi thời gian giữ phòng kết thúc.
                            </p>
                        </div>
                        {/* HỖ TRỢ 24/7 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
                            <h4 className="font-bold text-slate-800 text-[15px]">Hỗ trợ 24/7</h4>
                            <p>Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giúp bạn mọi lúc</p>
                            <div className="flex items-center gap-2 text-blue-700 font-black">
                                <PhoneCall size={18} />
                                <span className="text-base">1900 1234</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}