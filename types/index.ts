import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: string
      branch_id: string | null
      is_active: boolean
    }
  }
}

export type Role = 'admin' | 'fleet_officer' | 'fuel_officer' | 'branch_manager' | 'viewer'

export interface IBranch {
  _id: string
  name: string
  code: string
  location: string
  state?: string
  address?: string
  manager_name?: string
  phone?: string
  email?: string
  is_active: boolean
  notes?: string
  createdAt: string
}

export interface IUser {
  _id: string
  name: string
  email: string
  role: Role
  phone?: string
  employee_id?: string
  branch_id?: string | IBranch
  is_active: boolean
  createdAt: string
}

export interface IVehicle {
  _id: string
  registration_number: string
  fleet_number?: string
  make: string
  model: string
  year?: number
  color?: string
  type: string
  status: 'active' | 'in_service' | 'breakdown' | 'decommissioned'
  engine_number?: string
  chassis_number?: string
  current_mileage: number
  fuel_capacity?: number
  avg_fuel_consumption?: number
  branch_id?: string | IBranch
  assigned_driver_id?: string | IUser
  last_service_date?: string
  last_service_mileage?: number
  next_service_mileage?: number
  insurance_expiry?: string
  road_worthiness_expiry?: string
  notes?: string
  createdAt: string
}

export interface IFuelTank {
  _id: string
  name: string
  tank_number: string
  fuel_type: string
  capacity: number
  current_level: number
  minimum_level: number
  branch_id?: string | IBranch
  is_active: boolean
  notes?: string
}

export interface IFuelReceipt {
  _id: string
  reference_number: string
  fuel_tank_id: string | IFuelTank
  branch_id: string | IBranch
  received_by?: string | IUser
  supplier_name?: string
  quantity_received: number
  price_per_litre?: number
  total_cost?: number
  tank_level_before?: number
  tank_level_after?: number
  receipt_date: string
  notes?: string
  createdAt: string
}

export interface IFuelDispensing {
  _id: string
  reference_number: string
  fuel_tank_id: string | IFuelTank
  branch_id: string | IBranch
  vehicle_id?: string | IVehicle
  dispensed_by?: string | IUser
  driver_id?: string | IUser
  purpose: string
  quantity_dispensed: number
  tank_level_before?: number
  tank_level_after?: number
  vehicle_mileage?: number
  dispensing_date: string
  notes?: string
  createdAt: string
}

export interface IServiceRecord {
  _id: string
  reference_number: string
  vehicle_id: string | IVehicle
  branch_id?: string | IBranch
  created_by?: string | IUser
  approved_by?: string | IUser
  service_type: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  service_date: string
  completion_date?: string
  mileage_at_service?: number
  mechanic_name?: string
  workshop?: string
  labour_cost: number
  parts_cost: number
  total_cost: number
  description: string
  parts_replaced?: string
  next_service_mileage?: number
  next_service_date?: string
  createdAt: string
}

export interface IStaff {
  _id: string
  full_name: string
  staff_number: string
  phone?: string
  email?: string
  designation: string
  license_number?: string
  license_expiry?: string
  license_class?: string
  branch_id?: string | IBranch
  hire_date?: string
  is_active: boolean
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  createdAt: string
}

export interface IActivityLog {
  _id: string
  user_id?: string | IUser
  action: string
  model_type: string
  model_label?: string
  description: string
  ip_address?: string
  changes?: Record<string, any>
  createdAt: string
}
