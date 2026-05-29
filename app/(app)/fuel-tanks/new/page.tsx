import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import FuelTankForm from '../FuelTankForm'

export default async function NewFuelTankPage() {
  await connectDB()
  const branches = await BranchModel.find({ is_active: true }).sort({ name: 1 }).lean()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Add Fuel Tank</h1>
        <p className="text-sm text-gray-500 mt-0.5">Register a new fuel storage tank</p>
      </div>
      <FuelTankForm branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  )
}
