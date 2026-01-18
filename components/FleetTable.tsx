
import React from 'react';
import { Truck, TruckStatus } from '../types';
import { translations, Language } from '../translations';

interface FleetTableProps {
  trucks: Truck[];
  onViewDetailedLog?: () => void;
  lang?: Language;
}

const FleetTable: React.FC<FleetTableProps> = ({ trucks, onViewDetailedLog, lang = 'en' }) => {
  const t = translations[lang];

  const getStatusBadge = (status: TruckStatus) => {
    const styles = {
      [TruckStatus.ACTIVE]: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
      [TruckStatus.IDLE]: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
      [TruckStatus.UNDER_REPAIR]: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
      [TruckStatus.RETIRED]: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
    };
    
    const statusLabel = status === TruckStatus.ACTIVE ? t.statusActive : 
                       status === TruckStatus.IDLE ? t.statusIdle : 
                       status === TruckStatus.UNDER_REPAIR ? t.statusRepair : t.statusRetired;

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
        {statusLabel}
      </span>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t.fleetStatus}</h2>
          <p className="text-slate-400 text-xs font-medium">
            {t.monitoringUnits.replace('{count}', trucks.length.toString())}
          </p>
        </div>
        <button 
          onClick={onViewDetailedLog}
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
        >
          {t.viewDetailedLog}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-50">
              <th className="px-8 py-5">{t.vehiclePlate}</th>
              <th className="px-8 py-5">{t.operationalStatus}</th>
              <th className="px-8 py-5">{t.totalDistance}</th>
              <th className="px-8 py-5">{t.healthIndex}</th>
              <th className="px-8 py-5 text-center">{t.options}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {trucks.map((truck) => (
              <tr key={truck.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <i className="fas fa-truck text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{truck.model}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{truck.plate}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">{getStatusBadge(truck.status)}</td>
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{truck.mileage.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400">{t.kilometers}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getHealthColor(truck.healthScore)} transition-all duration-1000`} 
                        style={{ width: `${truck.healthScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-slate-900">{truck.healthScore}%</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <button className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-200 hover:text-slate-600 transition-all">
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetTable;
