
export enum TruckStatus {
  ACTIVE = 'Active',
  IDLE = 'Idle',
  UNDER_REPAIR = 'Under Repair',
  RETIRED = 'Retired'
}

export interface Truck {
  id: string;
  vin: string;
  plate: string;
  model: string;
  year: number;
  fuelType: string;
  loadCapacity: number;
  status: TruckStatus;
  healthScore: number;
  mileage: number;
}

export interface Trip {
  id: string;
  truckId: string;
  driverId: string;
  origin: string;
  destination: string;
  date: string;
  distance: number;
  fuelConsumed: number;
  revenue: number;
  costs: {
    fuel: number;
    driverPay: number;
    tolls: number;
    other: number;
  };
  completed: boolean;
}

export interface Driver {
  id: string;
  name: string;
  photoUrl?: string;
  licenseNumber: string;
  licenseExpiry: string;
  yearsExperience: number;
  specializations: string[]; // e.g., Hazmat, Oversize, Refrigerated
  availability: 'Full-time' | 'Part-time' | 'Contract';
  lastBackgroundCheck?: string;
  assignedTruckId?: string;
  performanceScore: number;
  phoneNumber: string;
  email: string;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  date: string;
  description: string;
  cost: number;
  mileageAtService: number;
  nextServiceDue: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'Financial' | 'Operational' | 'Safety';
  date: string;
  content?: string;
}
