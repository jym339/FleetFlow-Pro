
import React, { useState, useEffect, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';
import FleetTable from './components/FleetTable';
import { Truck, TruckStatus, Trip, Driver, Report } from './types';
import { translations, Language } from './translations';
import { db } from './services/database';

const INITIAL_MOCK_TRUCKS: Truck[] = [
  { id: '1', vin: 'TRK001', plate: 'FLT-101', model: 'Volvo FH16', year: 2022, fuelType: 'Diesel', loadCapacity: 40000, status: TruckStatus.ACTIVE, healthScore: 92, mileage: 45200 },
  { id: '2', vin: 'TRK002', plate: 'FLT-202', model: 'Scania R500', year: 2021, fuelType: 'Diesel', loadCapacity: 35000, status: TruckStatus.ACTIVE, healthScore: 78, mileage: 88400 },
  { id: '3', vin: 'TRK003', plate: 'FLT-303', model: 'Mercedes Actros', year: 2023, fuelType: 'Electric', loadCapacity: 25000, status: TruckStatus.IDLE, healthScore: 98, mileage: 12000 },
  { id: '4', vin: 'TRK004', plate: 'FLT-404', model: 'Kenworth T680', year: 2020, fuelType: 'Diesel', loadCapacity: 42000, status: TruckStatus.UNDER_REPAIR, healthScore: 45, mileage: 156000 },
  { id: '5', vin: 'TRK005', plate: 'FLT-505', model: 'Freightliner Cascadia', year: 2021, fuelType: 'Diesel', loadCapacity: 40000, status: TruckStatus.ACTIVE, healthScore: 85, mileage: 92000 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState<Language>('en');
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('30d');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await db.seed(INITIAL_MOCK_TRUCKS);
      const [storedTrucks, storedTrips, storedDrivers, storedReports] = await Promise.all([
        db.getTrucks(),
        db.getTrips(),
        db.getDrivers(),
        db.getReports()
      ]);
      setTrucks(storedTrucks);
      setTrips(storedTrips);
      setDrivers(storedDrivers);
      setReports(storedReports);
      setIsLoading(false);
    };
    initData();
  }, []);

  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const specs = (formData.get('specializations') as string).split(',').map(s => s.trim()).filter(Boolean);
    
    const newDriver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      licenseNumber: formData.get('license') as string,
      licenseExpiry: formData.get('licenseExpiry') as string,
      yearsExperience: Number(formData.get('yearsExperience')),
      availability: formData.get('availability') as any,
      specializations: specs,
      phoneNumber: formData.get('phoneNumber') as string,
      email: formData.get('email') as string,
      photoUrl: formData.get('photoUrl') as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name') as string)}&background=random`,
      assignedTruckId: formData.get('truckId') as string || undefined,
      performanceScore: 100,
      lastBackgroundCheck: new Date().toISOString().split('T')[0]
    };
    await db.saveDriver(newDriver);
    setDrivers(await db.getDrivers());
    setShowDriverModal(false);
  };

  const handleAddTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      truckId: formData.get('truckId') as string,
      driverId: formData.get('driverId') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      date: new Date().toISOString(),
      distance: Number(formData.get('distance')),
      fuelConsumed: Number(formData.get('distance')) * 0.3,
      revenue: Number(formData.get('revenue')),
      costs: { fuel: Number(formData.get('distance')) * 0.6, driverPay: 400, tolls: 50, other: 0 },
      completed: true
    };
    await db.saveTrip(newTrip);
    setTrips(await db.getTrips());
    setShowTripModal(false);
  };

  const handleUpsertTruck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const truckData: Truck = {
      id: editingTruck?.id || Math.random().toString(36).substr(2, 9),
      vin: formData.get('vin') as string,
      plate: formData.get('plate') as string,
      model: formData.get('model') as string,
      year: Number(formData.get('year')),
      fuelType: formData.get('fuelType') as string,
      loadCapacity: Number(formData.get('loadCapacity')),
      status: formData.get('status') as TruckStatus,
      healthScore: editingTruck?.healthScore || 100,
      mileage: editingTruck?.mileage || 0,
    };
    await db.saveTruck(truckData);
    setTrucks(await db.getTrucks());
    setShowTruckModal(false);
    setEditingTruck(null);
  };

  const handleRemoveTruck = async (id: string) => {
    const confirmMsg = lang === 'fr' ? "Êtes-vous sûr de vouloir supprimer ce camion ?" : "Are you sure you want to remove this truck?";
    if (confirm(confirmMsg)) {
      const allTrucks = await db.getTrucks();
      const updatedTrucks = allTrucks.filter(t => t.id !== id);
      localStorage.setItem('fleet_flow_trucks', JSON.stringify(updatedTrucks));
      setTrucks(updatedTrucks);
    }
  };

  const handleUpsertReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reportData: Report = {
      id: editingReport?.id || Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      type: formData.get('type') as any,
      content: formData.get('content') as string,
      date: new Date().toISOString(),
    };
    await db.saveReport(reportData);
    setReports(await db.getReports());
    setShowReportModal(false);
    setEditingReport(null);
  };

  const handleRemoveReport = async (id: string) => {
    const confirmMsg = lang === 'fr' ? "Êtes-vous sûr de vouloir supprimer ce rapport ?" : "Are you sure you want to remove this report?";
    if (confirm(confirmMsg)) {
      await db.removeReport(id);
      setReports(await db.getReports());
    }
  };

  const getTimeRangeLabel = () => {
    if (timeRange === '24h') return t.last24Hours;
    if (timeRange === '7d') return t.last7Days;
    return t.last30Days;
  };

  const getFilteredTrips = () => {
    const now = new Date();
    return trips.filter(trip => {
      const tripDate = new Date(trip.date);
      const diffTime = Math.abs(now.getTime() - tripDate.getTime());
      if (timeRange === '24h') return diffTime <= 24 * 60 * 60 * 1000;
      if (timeRange === '7d') return diffTime <= 7 * 24 * 60 * 60 * 1000;
      return diffTime <= 30 * 24 * 60 * 60 * 1000;
    });
  };

  const getFilteredMetrics = () => {
    const filtered = getFilteredTrips();
    const revenueValue = filtered.reduce((acc, trip) => acc + trip.revenue, 0);
    const distance = filtered.reduce((acc, trip) => acc + trip.distance, 0);
    const fuelCost = filtered.reduce((acc, trip) => acc + trip.costs.fuel, 0);
    const avgFuelCost = distance > 0 ? (fuelCost / distance).toFixed(2) : '0.00';
    
    return {
      revenue: revenueValue.toLocaleString(),
      avgFuel: avgFuelCost,
      tripCount: filtered.length
    };
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium tracking-wide animate-pulse">
            {lang === 'fr' ? 'Connexion à la base de données...' : 'Connecting to database...'}
          </p>
        </div>
      );
    }

    const metrics = getFilteredMetrics();

    switch (activeTab) {
      case 'reports':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{t.reports}</h3>
              <button 
                onClick={() => { setEditingReport(null); setShowReportModal(true); }}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-500 transition-all"
              >
                <i className="fas fa-plus mr-2"></i> {t.addReport}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.length > 0 ? reports.map(report => (
                <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                      <i className={`fas ${report.type === 'Financial' ? 'fa-file-invoice-dollar' : 'fa-file-chart-column'} text-xl`}></i>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingReport(report); setShowReportModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button onClick={() => handleRemoveReport(report.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 leading-tight mb-2">{report.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3 font-medium mb-4">{report.content || 'No description provided.'}</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                      {report.type === 'Financial' ? t.financial : report.type === 'Operational' ? t.operational : t.safety}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic">
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                   <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                     <i className="fas fa-clipboard-list text-3xl"></i>
                   </div>
                   <p className="text-slate-500 font-bold">{t.noReports}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{t.drivers}</h3>
              <button onClick={() => { setShowDriverModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-500 transition-all">
                <i className="fas fa-plus mr-2"></i> {t.addDriver}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map(driver => (
                <div 
                  key={driver.id} 
                  onClick={() => { setSelectedDriver(driver); }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={driver.photoUrl} 
                      alt={driver.name} 
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{driver.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.license}: {driver.licenseNumber}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-600 rounded-md uppercase tracking-wider">{driver.availability}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-400">{t.yearsExp}</span>
                      <span className="text-slate-800 font-bold">{driver.yearsExperience} yrs</span>
                    </div>
                    <div className="pt-2">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.performance}</span>
                         <span className="text-xs font-black text-indigo-600">{driver.performanceScore}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${driver.performanceScore}%` }}></div>
                       </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">View full screening</span>
                    <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'fleet':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{t.fleet}</h3>
              <button 
                onClick={() => { setEditingTruck(null); setShowTruckModal(true); }}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-500 transition-all"
              >
                <i className="fas fa-plus mr-2"></i> {t.addTruck}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trucks.map(truck => (
                <div key={truck.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                      <i className="fas fa-truck text-indigo-500 text-xl"></i>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setEditingTruck(truck); setShowTruckModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <i className="fas fa-edit"></i>
                       </button>
                       <button onClick={(e) => { e.stopPropagation(); handleRemoveTruck(truck.id); }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <i className="fas fa-trash-alt"></i>
                       </button>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${truck.status === TruckStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                         {truck.status === TruckStatus.ACTIVE ? t.statusActive : 
                          truck.status === TruckStatus.IDLE ? t.statusIdle : 
                          truck.status === TruckStatus.UNDER_REPAIR ? t.statusRepair : t.statusRetired}
                       </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{truck.model}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{truck.plate} • {truck.vin}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.capacity}</p>
                      {truck.loadCapacity.toLocaleString()} kg
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.fuelType}</p>
                      {truck.fuelType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <FleetTable trucks={trucks} onViewDetailedLog={() => setActiveTab('trips')} lang={lang} />
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title={t.activeTrucks} value={`${trucks.filter(truck => truck.status === TruckStatus.ACTIVE).length} / ${trucks.length}`} trend={{ value: '8.4%', isUp: true }} icon="fa-truck-bolt" color="bg-indigo-500" />
              <StatCard title={`${getTimeRangeLabel()} - ${t.revenue}`} value={`$${metrics.revenue}`} trend={{ value: '12.1%', isUp: true }} icon="fa-chart-line-up" color="bg-emerald-500" />
              <StatCard title={t.fuelCost} value={`$${metrics.avgFuel}`} trend={{ value: '1.8%', isUp: false }} icon="fa-droplet" color="bg-amber-500" />
              <div onClick={() => setShowMaintenanceModal(true)} className="cursor-pointer">
                <StatCard title={t.alerts} value={`${trucks.filter(truck => truck.healthScore < 70).length} ${t.pending}`} icon="fa-bell-exclamation" color="bg-rose-500" />
              </div>
            </div>
            <FleetTable trucks={trucks} onViewDetailedLog={() => setActiveTab('trips')} lang={lang} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col md:flex-row font-sans selection:bg-indigo-100 overflow-x-hidden">
      <aside className="w-full md:w-72 bg-slate-900 text-slate-400 md:h-screen sticky top-0 flex flex-col z-[60] shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl"><i className="fas fa-truck-fast text-white text-xl"></i></div>
          <div className="flex flex-col"><span className="text-white font-black text-xl tracking-tight leading-none">FleetFlow</span><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Professional</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', icon: 'fa-grid-2', label: t.overview },
            { id: 'fleet', icon: 'fa-truck-front', label: t.fleet },
            { id: 'drivers', icon: 'fa-user-group', label: t.drivers },
            { id: 'trips', icon: 'fa-map-location-dot', label: t.trips },
            { id: 'finance', icon: 'fa-receipt', label: t.finance },
            { id: 'maintenance', icon: 'fa-screwdriver-wrench', label: t.maintenance },
            { id: 'reports', icon: 'fa-chart-mixed', label: t.reports },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-indigo-600/10 text-white border-l-4 border-indigo-500' : 'hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <i className={`fas ${item.icon} w-5 text-lg ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.planUsage}</span><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold italic uppercase">Free</span></div>
            <div className="flex justify-between items-end mb-2"><span className="text-xs font-medium text-slate-300">{t.truckSlots}</span><span className="text-sm font-bold text-white">{trucks.length} <span className="text-slate-500">/ 50</span></span></div>
            <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${(trucks.length / 50) * 100}%` }}></div></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <DashboardHeader lang={lang} setLang={setLang} />
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                {isLoading ? 'Sync' : lang === 'fr' ? 'Base Liée' : 'Database Linked'}
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{activeTab === 'overview' ? t.operationalOverview : translations[lang][activeTab as keyof typeof translations['en']]}</h1>
              <p className="text-slate-500 font-medium">{t.realTimeStatus}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={timeDropdownRef}>
                <button onClick={() => setShowTimeDropdown(!showTimeDropdown)} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-200 transition-all shadow-sm">
                  <i className="far fa-calendar-alt"></i> {getTimeRangeLabel()}
                </button>
                {showTimeDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[70] animate-in slide-in-from-top-2 duration-200">
                    {(['24h', '7d', '30d'] as const).map((range) => (
                      <button key={range} onClick={() => { setTimeRange(range); setShowTimeDropdown(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${timeRange === range ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}>
                        {range === '24h' ? t.last24Hours : range === '7d' ? t.last7Days : t.last30Days}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowTripModal(true)} className="flex items-center gap-2 bg-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-xl transition-all transform active:scale-95">
                <i className="fas fa-plus"></i> {t.newTrip}
              </button>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Driver Detail Modal (Extended) */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
               <h4 className="text-2xl font-black text-slate-900">{t.driverDetails}</h4>
               <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
               <img 
                 src={selectedDriver.photoUrl} 
                 alt={selectedDriver.name} 
                 className="w-40 h-40 rounded-[2rem] object-cover shadow-2xl ring-4 ring-indigo-50"
               />
               <div className="text-center md:text-left">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedDriver.name}</h2>
                 <p className="text-indigo-600 font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-center md:justify-start gap-2">
                   <i className="fas fa-id-card"></i> {selectedDriver.licenseNumber}
                 </p>
                 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                   <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedDriver.availability}</span>
                   <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedDriver.yearsExperience} Years Exp.</span>
                   <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Perf: {selectedDriver.performanceScore}%</span>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <i className="fas fa-info-circle"></i> {t.professionalHistory}
                   </h5>
                   <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500">{t.licenseExpiry}</span>
                       <span className="text-xs font-black text-slate-800">{selectedDriver.licenseExpiry}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500">{t.backgroundCheck}</span>
                       <span className="text-xs font-black text-emerald-600">{selectedDriver.lastBackgroundCheck} (Passed)</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <i className="fas fa-star"></i> {t.specializations}
                   </h5>
                   <div className="flex flex-wrap gap-2">
                     {selectedDriver.specializations.map(spec => (
                       <span key={spec} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm">{spec}</span>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="space-y-6">
                 <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <i className="fas fa-address-book"></i> {t.contactInfo}
                   </h5>
                   <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                     <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400"><i className="fas fa-phone"></i></div>
                       <span className="text-sm font-bold text-slate-800">{selectedDriver.phoneNumber}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400"><i className="fas fa-envelope"></i></div>
                       <span className="text-sm font-bold text-slate-800">{selectedDriver.email}</span>
                     </div>
                   </div>
                 </div>

                 <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.assignedTruck}</h5>
                    <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-200">
                      <div className="flex items-center gap-4">
                        <i className="fas fa-truck text-2xl"></i>
                        <div>
                          <p className="font-black text-lg">{trucks.find(t => t.id === selectedDriver.assignedTruckId)?.plate || 'No Truck'}</p>
                          <p className="text-[10px] font-bold opacity-75 uppercase">{trucks.find(t => t.id === selectedDriver.assignedTruckId)?.model || 'Pending Assignment'}</p>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
             </div>

             <div className="mt-10 p-4 border border-indigo-100 bg-indigo-50/30 rounded-2xl">
               <p className="text-[10px] font-bold text-indigo-400 text-center uppercase tracking-widest">Driver screening completed successfully. All documents verified for insurance compliance.</p>
             </div>
          </div>
        </div>
      )}

      {showDriverModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
              <h4 className="text-2xl font-black text-slate-900">{t.addDriver}</h4>
              <button onClick={() => setShowDriverModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleAddDriver} className="space-y-8">
              <section className="space-y-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Basic Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.driverName}</label><input name="name" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profile Photo URL</label><input name="photoUrl" placeholder="https://..." className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label><input type="email" name="email" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label><input name="phoneNumber" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                </div>
              </section>

              <section className="space-y-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Professional Credentials</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.license}</label><input name="license" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.licenseExpiry}</label><input type="date" name="licenseExpiry" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.yearsExp}</label><input type="number" name="yearsExperience" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.availability}</label><select name="availability" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.assignedTruck}</label><select name="truckId" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800"><option value="">Unassigned</option>{trucks.map(truck => (<option key={truck.id} value={truck.id}>{truck.plate}</option>))}</select></div>
                </div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.specializations} (Comma separated)</label><input name="specializations" placeholder="e.g. Hazmat, Refrigerated, Long Haul" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
              </section>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest transform active:scale-95">Enroll Driver for Screening</button>
            </form>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
               <h4 className="text-2xl font-black text-slate-900">{t.maintenanceDetails}</h4>
               <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
             </div>
             <div className="space-y-4">
                {trucks.filter(tk => tk.healthScore < 70).map(tk => (
                  <div key={tk.id} className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-between group hover:bg-rose-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white text-xl">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900">{tk.model} ({tk.plate})</h5>
                        <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mt-1">{t.lowHealth}: {tk.healthScore}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-500 uppercase">{t.needsService}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {showTripModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black text-slate-900">{t.newTrip}</h4>
              <button onClick={() => setShowTripModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleAddTrip} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.selectVehicle}</label><select name="truckId" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800 appearance-none">{trucks.map(truck => (<option key={truck.id} value={truck.id}>{truck.plate}</option>))}</select></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.selectDriver}</label><select name="driverId" required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800 appearance-none">{drivers.map(driver => (<option key={driver.id} value={driver.id}>{driver.name}</option>))}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.origin}</label><input name="origin" required placeholder="e.g. Paris" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.destination}</label><input name="destination" required placeholder="e.g. Berlin" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.distance}</label><input name="distance" type="number" required placeholder="1050" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.revenue}</label><input name="revenue" type="number" required placeholder="2500" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-800" /></div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest mt-4">{t.saveTrip}</button>
            </form>
          </div>
        </div>
      )}

      {showTruckModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black text-slate-900">{editingTruck ? t.editTruck : t.addTruck}</h4>
              <button onClick={() => setShowTruckModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleUpsertTruck} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.model}</label><input name="model" defaultValue={editingTruck?.model} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.plateNumber}</label><input name="plate" defaultValue={editingTruck?.plate} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" /></div>
              </div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.vin}</label><input name="vin" defaultValue={editingTruck?.vin} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.year}</label><input name="year" type="number" defaultValue={editingTruck?.year} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.capacity}</label><input name="loadCapacity" type="number" defaultValue={editingTruck?.loadCapacity} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.fuelType}</label><select name="fuelType" defaultValue={editingTruck?.fuelType} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium appearance-none"><option>Diesel</option><option>Electric</option><option>Hydrogen</option></select></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.status}</label><select name="status" defaultValue={editingTruck?.status} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium appearance-none"><option value={TruckStatus.ACTIVE}>{t.statusActive}</option><option value={TruckStatus.IDLE}>{t.statusIdle}</option><option value={TruckStatus.UNDER_REPAIR}>{t.statusRepair}</option></select></div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest mt-4">
                {editingTruck ? t.updateTruck : t.saveTruck}
              </button>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-2xl font-black text-slate-900">{editingReport ? t.editReport : t.addReport}</h4>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleUpsertReport} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.reportTitle}</label>
                <input name="title" defaultValue={editingReport?.title} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.reportType}</label>
                <select name="type" defaultValue={editingReport?.type || 'Operational'} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium appearance-none">
                  <option value="Financial">{t.financial}</option>
                  <option value="Operational">{t.operational}</option>
                  <option value="Safety">{t.safety}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.reportDetails}</label>
                <textarea 
                  name="content" 
                  defaultValue={editingReport?.content} 
                  required 
                  rows={4}
                  placeholder="Enter detailed analysis, findings or notes..."
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 font-medium resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest mt-4">
                {editingReport ? t.updateReport : t.saveReport}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
