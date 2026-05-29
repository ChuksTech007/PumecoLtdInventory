import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import UserModel from '@/models/User'
import VehicleForm from '../VehicleForm'

export default async function NewVehiclePage() {
  await connectDB()
  const [branches, drivers] = await Promise.all([
    BranchModel.find({ is_active: true }).lean(),
    UserModel.find({ is_active: true }).lean(),
  ])
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Add Vehicle</h1>
        <p className="text-sm text-gray-500 mt-0.5">Register a new fleet vehicle</p>
      </div>
      <VehicleForm branches={JSON.parse(JSON.stringify(branches))} drivers={JSON.parse(JSON.stringify(drivers))} />
    </div>
  )
}
