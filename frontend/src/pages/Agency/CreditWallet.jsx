import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/axios.config";

const CreditWallet = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const agencyId = user?.agencyId;

    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({});

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
                <h2 className="text-lg font-semibold mb-4">Tổng quan tín dụng</h2>
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
                        <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition">
                            Thanh toán nợ
                        </button>
                    </div>

                    <div className="bg-blue-50 rounded-md p-4 shadow-sm flex flex-col items-center">
                        <p className="text-sm text-slate-600">Tổng hạn mức được cấp</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.creditLimit)}</p>
                        <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition">
                            Xin nới hạn mức
                        </button>
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
        </div>
    );
};

export default CreditWallet;
