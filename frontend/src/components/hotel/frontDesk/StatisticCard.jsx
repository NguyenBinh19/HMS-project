import React from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

const StatCard = ({ title, count, sub, type, active, onClick }) => {
    const icons = {
        arrival: <ChevronLeft className="rotate-90 text-blue-500" />,
        departure: <ChevronRight className="-rotate-90 text-amber-500" />,
        stay: <Home className="text-emerald-500" />
    };

    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-3xl border cursor-pointer transition-all ${active ? 'bg-white border-blue-200 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 opacity-70 hover:opacity-100'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase">{title}</h3>
                <div className={`p-2 rounded-xl ${active ? 'bg-blue-50' : 'bg-slate-50'}`}>{icons[type]}</div>
            </div>
            <div className="text-4xl font-black text-slate-800">{count}</div>
            <div className="text-[11px] font-bold text-slate-400 mt-2">{sub}</div>
        </div>
    );
};

export default StatCard;