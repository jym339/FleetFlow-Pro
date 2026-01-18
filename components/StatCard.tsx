
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color }) => {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-500`}>
          <i className={`fas ${icon} text-xl ${color.replace('bg-', 'text-')}`}></i>
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <i className={`fas fa-arrow-${trend.isUp ? 'up' : 'down'} text-[8px]`}></i>
            {trend.value}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
    </div>
  );
};

export default StatCard;
