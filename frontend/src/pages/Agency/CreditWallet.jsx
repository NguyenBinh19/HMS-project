import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle, ExternalLink, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/axios.config";
import { pdfDocumentService } from "@/services/pdf.service.js";
import Swal from "sweetalert2";

const CreditWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agencyId = user?.agencyId;

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalCredit: 0,
    usedCredit: 0,
    remainingCredit: 0,
  });

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [policyUrl, setPolicyUrl] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(true);

// Tải link PDF chính sách tín dụng
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const pdfRes = await api.get("/pdf-documents");
        if (pdfRes?.data?.result) {
          const policyDoc = pdfRes.data.result.find(doc =>
              doc.title.includes("Phụ lục tín dụng") ||
              doc.title.includes("thanh toán công nợ")
          );
          setPolicyUrl(policyDoc?.fileUrl || "");
        }
      } catch (error) {
        console.error("Không thể tải chính sách tín dụng:", error);
      }
    };
    fetchPolicy();
  }, []);

// Khóa cuộn trang khi mở modal
  useEffect(() => {
    document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPdfModal]);

  const handlePayDebt = async () => {
    const { value: amount } = await Swal.fire({
      title: "Nhập số tiền muốn thanh toán",
      input: "number",
      inputAttributes: { min: 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      text: "Tiền sẽ được trừ lãi trước, sau đó trừ gốc (ưu tiên tháng cũ)."
    });

    if (amount) {
      api.post(`/agencies/${agencyId}/pay-debt?payment=${amount}`)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Thanh toán thành công",
            text: `Bạn đã thanh toán ${Number(amount).toLocaleString("vi-VN")} ₫`,
            confirmButtonColor: "#3085d6",
          });
          return api.get(`/agencies/${agencyId}/credit-summary`);
        })
        .then((res) => setSummary(res.data.result || {}))
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Thanh toán thất bại",
            text: err.response?.data?.message || err.message,
            confirmButtonColor: "#d33",
          });
        });
    }
  };

  useEffect(() => {
    if (agencyId) {
      api.get(`/transaction-history/${agencyId}/transactions/recent?limit=5`)
        .then((res) => setTransactions(res.data.result || []))
        .catch((err) => console.error("Error fetching transactions:", err));

      api.get(`/agencies/${agencyId}/credit-summary`)
        .then((res) => setSummary(res.data.result || {}))
        .catch((err) => console.error("Error fetching credit summary:", err));
    }
  }, [agencyId]);

  const formatAmount = (amount, direction) => {
    const formatted = amount?.toLocaleString("vi-VN") + " ₫";
    return direction === "IN" ? `+${formatted}` : `-${formatted}`;
  };

  const formatCurrency = (value) => {
    return value?.toLocaleString("vi-VN") + " ₫";
  };

  const getIcon = (tx) => {
    if (tx.direction === "IN") return <ArrowDownCircle size={18} className="text-green-600" />;
    if (tx.direction === "OUT" && tx.sourceType === "Wallet") return <ArrowUpCircle size={18} className="text-red-500" />;
    return <CreditCard size={18} className="text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Trung tâm tài chính</h1>

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

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Tổng quan tín dụng</h2>
          {/* Nút Xem chính sách */}
          {policyUrl && (
              <button
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 text-[11px] font-black text-black-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wider"
              >
                <ExternalLink size={14}/> Phụ lục công nợ
              </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-green-50 rounded-md p-4 shadow-sm flex flex-col items-center">
            <p className="text-sm text-slate-600">Sức mua tín dụng còn lại</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.remainingCredit)}</p>
            <p className="text-xs text-slate-500 mt-1">Đã sử dụng {summary.usedPercent}%</p>
          </div>

          <div className="bg-yellow-100 rounded-md p-4 shadow-sm flex flex-col items-center">
            <p className="text-sm text-slate-600">Nợ cần thanh toán</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.debt)}</p>
            <p className="text-xs text-slate-500 mt-1">Hạn chót: {summary.dueDate}</p>
            <button
              onClick={handlePayDebt}
              className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition"
            >
              Thanh toán nợ
            </button>
          </div>

          <div className="bg-blue-50 rounded-md p-4 shadow-sm flex flex-col items-center">
            <p className="text-sm text-slate-600">Tổng hạn mức được cấp</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.creditLimit)}</p>
            {/*<button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition">*/}
            {/*  Xin nới hạn mức*/}
            {/*</button>*/}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ul className="divide-y divide-slate-200">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {getIcon(tx)}
                <div className="flex flex-col">
                  <span className="text-slate-800 font-medium leading-tight">
                    {tx.transactionType}
                  </span>
                  <span className="text-slate-600 text-sm">{tx.description}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`font-semibold text-right ${tx.direction === "IN" ? "text-green-600" : "text-red-500"}`}
                >
                  {formatAmount(tx.amount, tx.direction)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate("/agency/transaction-history")}
          className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline"
        >
          Xem tất cả lịch sử &gt;
        </button>
      </div>
      {/* MODAL PDF CHÍNH SÁCH TÍN DỤNG */}
      {showPdfModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
              {/* Header Modal - Nút điều hướng */}
              <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                <a
                    href={policyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                    title="Mở trong tab mới"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                    onClick={() => {
                      setShowPdfModal(false);
                      setIsPdfLoading(true);
                    }}
                    className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                {policyUrl ? (
                    <div className="w-full h-full overflow-hidden">
                      <object
                          data={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                          type="application/pdf"
                          style={{
                            width: '100%',
                            height: 'calc(100% + 40px)',
                            marginTop: '-40px'
                          }}
                          className="relative z-10"
                          onLoad={() => setIsPdfLoading(false)}
                      >
                        <iframe
                            src={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                            className="w-full h-full border-none"
                            title="Credit Policy Preview"
                            onLoad={() => setIsPdfLoading(false)}
                        />
                      </object>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
                      <p className="text-sm font-medium">Tài liệu chính sách chưa khả dụng.</p>
                    </div>
                )}

                {isPdfLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[20] bg-slate-50">
                      <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                            Đang tải phụ lục tín dụng...
                        </span>
                    </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default CreditWallet;
