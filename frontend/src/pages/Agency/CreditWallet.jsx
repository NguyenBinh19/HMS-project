import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/axios.config";
import Swal from "sweetalert2";

const CreditWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agencyId = user?.agencyId;

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});

  // ================= FORMAT =================
  const formatAmount = (amount, direction) => {
    const formatted = amount?.toLocaleString("vi-VN") + " ₫";
    return direction === "IN" ? `+${formatted}` : `-${formatted}`;
  };

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const formatPercent = (value) => {
    if (!value) return "0%";
    return (value * 100).toFixed(2) + "%";
  };

  // ================= STATUS =================
  const getStatusColor = (status) => {
    switch (status) {
      case "WARNING":
        return "text-yellow-600";
      case "LOCKED":
        return "text-red-600";
      case "LEGAL":
        return "text-red-800";
      default:
        return "text-green-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "WARNING":
        return "Cảnh báo";
      case "LOCKED":
        return "Đã khóa";
      case "LEGAL":
        return "Xử lý pháp lý";
      default:
        return "Bình thường";
    }
  };

  // ================= ICON =================
  const getIcon = (tx) => {
    if (tx.direction === "IN")
      return <ArrowDownCircle size={18} className="text-green-600" />;
    if (tx.direction === "OUT" && tx.sourceType === "Wallet")
      return <ArrowUpCircle size={18} className="text-red-500" />;
    return <CreditCard size={18} className="text-red-500" />;
  };

  // ================= PAY =================
  const handlePayDebt = async () => {
    const maxDebt = Number(summary.debt || 0);

    const { value: amount } = await Swal.fire({
      title: "Nhập số tiền muốn thanh toán",
      input: "number",
      inputAttributes: {
        min: 1,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      text: `Tối đa: ${maxDebt.toLocaleString("vi-VN")} ₫`,

      didOpen: () => {
        const input = Swal.getInput();

        input.addEventListener("input", () => {
          let value = Number(input.value);

          // ❌ không cho nhập <= 0
          if (value <= 0) {
            input.value = "";
          }

          // ❌ nếu vượt max → auto set về max
          if (value > maxDebt) {
            input.value = maxDebt;
          }
        });
      },

      inputValidator: (value) => {
        if (!value) return "Vui lòng nhập số tiền";

        const num = Number(value);

        if (num <= 0) return "Số tiền phải lớn hơn 0";

        if (num > maxDebt) {
          return `Không được vượt quá ${maxDebt.toLocaleString("vi-VN")} ₫`;
        }

        return null;
      }
    });

    if (amount) {
      api.post(`/agencies/${agencyId}/pay-debt?payment=${amount}`)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Thanh toán thành công",
            text: `Bạn đã thanh toán ${Number(amount).toLocaleString("vi-VN")} ₫`,
          });
          return api.get(`/agencies/${agencyId}/credit-summary`);
        })
        .then((res) => setSummary(res.data.result || {}))
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Thanh toán thất bại",
            text: err.response?.data?.message || err.message,
          });
        });
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    if (agencyId) {
      api.get(`/transaction-history/${agencyId}/transactions/recent?limit=5`)
        .then((res) => setTransactions(res.data.result || []))
        .catch(console.error);

      api.get(`/agencies/${agencyId}/credit-summary`)
        .then((res) => setSummary(res.data.result || {}))
        .catch(console.error);
    }
  }, [agencyId]);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Trung tâm tài chính
      </h1>

      {/* NAV */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate("/agency/prepaid")}
          className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
            ${location.pathname === "/agency/prepaid"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
        >
          <Wallet size={18} /> Ví trả trước
        </button>

        <button
          onClick={() => navigate("/agency/credit-wallet")}
          className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
            ${location.pathname === "/agency/credit-wallet"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
        >
          <CreditCard size={18} /> Tín dụng
        </button>
      </div>

      {/* SUMMARY */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Tổng quan tín dụng</h2>

        <div className="grid grid-cols-3 gap-6 text-center">

          {/* REMAINING */}
          <div className="bg-green-50 rounded-md p-4 shadow-sm">
            <p className="text-sm text-slate-600">Sức mua còn lại</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.remainingCredit)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Đã sử dụng {summary.usedPercent}%
            </p>
          </div>

          {/* DEBT */}
          <div className="bg-yellow-100 rounded-md p-4 shadow-sm flex flex-col gap-2 relative group">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Nợ cần thanh toán</p>

              {/* ICON HOVER */}
              {summary.lateDays > 0 && (
                <div className="relative">
                  <span className="cursor-pointer text-slate-500 hover:text-slate-700">
                    ⓘ
                  </span>

                  {/* TOOLTIP */}
                  <div className="absolute right-0 mt-2 w-56 bg-white text-xs text-slate-700 
                        shadow-lg rounded-md p-3 opacity-0 group-hover:opacity-100 
                        pointer-events-none transition z-10">
                    <p>Quá hạn: <b>{summary.lateDays} ngày</b></p>
                    <p>Ngày làm việc: <b>{summary.lateWorkingDays}</b></p>
                    <p>Lãi suất: <b>{formatPercent(summary.penaltyRate)} / ngày</b></p>
                    <p className="text-red-500 font-semibold mt-1">
                      Lãi phạt: {formatCurrency(summary.penaltyAmount)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AMOUNT */}
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.debt)}
            </p>

            {/* FOOTER */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Hạn: {summary.dueDate}
              </span>

              {/* STATUS BADGE */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(summary.status)}`}>
                {getStatusLabel(summary.status)}
              </span>
            </div>

            {/* WARNING */}
            {summary.status === "LOCKED" && (
              <p className="text-xs text-red-600 font-bold">
                Tài khoản đã bị khóa
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={handlePayDebt}
              className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition"
            >
              Thanh toán nợ
            </button>
          </div>

          {/* LIMIT */}
          <div className="bg-blue-50 rounded-md p-4 shadow-sm">
            <p className="text-sm text-slate-600">Hạn mức tín dụng</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.creditLimit)}
            </p>
          </div>

        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="divide-y divide-slate-200">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3">
              <div className="flex items-center gap-3">
                {getIcon(tx)}
                <div>
                  <span className="font-medium">{tx.transactionType}</span>
                  <div className="text-sm text-slate-500">
                    {tx.description}
                  </div>
                </div>
              </div>

              <span
                className={`font-semibold ${tx.direction === "IN"
                  ? "text-green-600"
                  : "text-red-500"}`}
              >
                {formatAmount(tx.amount, tx.direction)}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/agency/transaction-history")}
          className="mt-4 w-full text-blue-600 text-sm hover:underline"
        >
          Xem tất cả lịch sử &gt;
        </button>
      </div>
    </div>
  );
};

export default CreditWallet;