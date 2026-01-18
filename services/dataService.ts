
import { Truck, Trip, Driver, TruckStatus } from '../types';

export const getTripsByTruck = (truckId: string): Trip[] => {
  // Mock logic to filter trips
  return [];
};

export const getMaintenanceHistory = (truckId: string) => {
  return [];
};

export const calculateFleetProfitability = (trips: Trip[]) => {
  const revenue = trips.reduce((acc, trip) => acc + (trip.completed ? trip.revenue : 0), 0);
  const costs = trips.reduce((acc, trip) => acc + (trip.costs.fuel + trip.costs.driverPay + trip.costs.tolls), 0);
  return { revenue, costs, profit: revenue - costs };
};
