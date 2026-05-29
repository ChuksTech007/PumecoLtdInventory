import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import BranchModel from '@/models/Branch'
import VehicleModel from '@/models/Vehicle'
import UserModel from '@/models/User'
import FuelDispensingForm from '../FuelDispensingForm'

export default async function NewFuelDispensingPage() {
  await connectDB()
  const [tanks, branches, vehicles, drivers] = await Promise.all([
    FuelTankModel.find({ is_active: true }).sort({ name: 1 }).lean(),
    BranchModel.find({ is_active: true }).sort({ name: 1 }).lean(),
    VehicleModel.find({ deleted_at: null, status: { $ne: 'decommissioned' } }).sort({ registration_number: 1 }).lean(),
    UserModel.find({ is_active: true }).sort({ name: 1 }).lean(),
  ])
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">New Fuel Dispensing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record fuel dispensed from a tank</p>
      </div>
      <FuelDispensingForm
        tanks={JSON.parse(JSON.stringify(tanks))}
        branches={JSON.parse(JSON.stringify(branches))}
        vehicles={JSON.parse(JSON.stringify(vehicles))}
        drivers={JSON.parse(JSON.stringify(drivers))}
      />
    </div>
  )
}
