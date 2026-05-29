import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import BranchModel from '@/models/Branch'
import FuelReceiptForm from '../FuelReceiptForm'

export default async function NewFuelReceiptPage() {
  await connectDB()
  const [tanks, branches] = await Promise.all([
    FuelTankModel.find({ is_active: true }).populate('branch_id', 'name').sort({ name: 1 }).lean(),
    BranchModel.find({ is_active: true }).sort({ name: 1 }).lean(),
  ])
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">New Fuel Receipt</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record incoming fuel delivery</p>
      </div>
      <FuelReceiptForm tanks={JSON.parse(JSON.stringify(tanks))} branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  )
}
