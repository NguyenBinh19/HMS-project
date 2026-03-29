import React from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

const StatCard = ({ title, count, sub, type, active, onClick }) => {
    const icons = {
        arrival: <ChevronLeft className="rotate-90 text-blue-600" />,
        departure: <ChevronRight className="-rotate-90 text-amber-500" />,
        // stay: <Home className="text-emerald-500" />
    };

    return (
        <div
            onClick={onClick}
            className={`p-8 rounded-[2.5rem] border transition-all duration-300 cursor-pointer ${
                active
                    ? 'bg-white border-blue-100 shadow-2xl shadow-blue-100 scale-[1.02]'
                    : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 opacity-70 hover:opacity-100'
            }`}
        >
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
                <div className={`p-3 rounded-2xl ${active ? 'bg-blue-50' : 'bg-white'}`}>{icons[type]}</div>
            </div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">{count}</div>
            <div className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                {sub}
            </div>
        </div>
    );
};

export default StatCard;