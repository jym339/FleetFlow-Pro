
import { Truck, Trip, MaintenanceRecord, Driver, Report } from '../types';

/**
 * Database Service
 * For MVP: Uses LocalStorage for immediate persistence.
 */

const STORAGE_KEYS = {
  TRUCKS: 'fleet_flow_trucks',
  TRIPS: 'fleet_flow_trips',
  MAINTENANCE: 'fleet_flow_maintenance',
  DRIVERS: 'fleet_flow_drivers',
  REPORTS: 'fleet_flow_reports'
};

export const db = {
  // --- TRUCKS ---
  async getTrucks(): Promise<Truck[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRUCKS);
    return data ? JSON.parse(data) : [];
  },

  async saveTruck(truck: Truck): Promise<void> {
    const trucks = await this.getTrucks();
    const index = trucks.findIndex(t => t.id === truck.id);
    if (index > -1) trucks[index] = truck;
    else trucks.push(truck);
    localStorage.setItem(STORAGE_KEYS.TRUCKS, JSON.stringify(trucks));
  },

  // --- TRIPS ---
  async getTrips(): Promise<Trip[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return data ? JSON.parse(data) : [];
  },

  async saveTrip(trip: Trip): Promise<void> {
    const trips = await this.getTrips();
    trips.push(trip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  },

  // --- MAINTENANCE ---
  async getMaintenance(): Promise<MaintenanceRecord[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return data ? JSON.parse(data) : [];
  },

  async saveMaintenance(record: MaintenanceRecord): Promise<void> {
    const records = await this.getMaintenance();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  },

  // --- DRIVERS ---
  async getDrivers(): Promise<Driver[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : [];
  },

  async saveDriver(driver: Driver): Promise<void> {
    const drivers = await this.getDrivers();
    const index = drivers.findIndex(d => d.id === driver.id);
    if (index > -1) drivers[index] = driver;
    else drivers.push(driver);
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  },

  // --- REPORTS ---
  async getReports(): Promise<Report[]> {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  },

  async saveReport(report: Report): Promise<void> {
    const reports = await this.getReports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index > -1) reports[index] = report;
    else reports.push(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  async removeReport(id: string): Promise<void> {
    const reports = await this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
  },

  // Helper to seed initial data
  async seed(initialTrucks: Truck[]) {
    const existing = await this.getTrucks();
    if (existing.length === 0) {
      localStorage.setItem(STORAGE_KEYS.TRUCKS, JSON.stringify(initialTrucks));
    }
    const drivers = await this.getDrivers();
    if (drivers.length === 0) {
      const initialDrivers: Driver[] = [
        { id: 'drv1', name: 'John Doe', licenseNumber: 'L-55231', assignedTruckId: '1', performanceScore: 94 },
        { id: 'drv2', name: 'Sarah Miller', licenseNumber: 'L-88210', assignedTruckId: '2', performanceScore: 88 }
      ];
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(initialDrivers));
    }
    const reports = await this.getReports();
    if (reports.length === 0) {
      const initialReports: Report[] = [
        { id: 'rep1', title: 'Q1 Performance Summary', type: 'Operational', date: new Date().toISOString() }
      ];
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
    }
  }
};
