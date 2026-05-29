import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import BranchModel from '@/models/Branch'
import FuelTankForm from '../../FuelTankForm'
import { notFound } from 'next/navigation'

export default async function EditFuelTankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [tank, branches] = await Promise.all([
    FuelTankModel.findById(id).lean(),
    BranchModel.find({ is_active: true }).sort({ name: 1 }).lean(),
  ])
  if (!tank) notFound()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Edit Fuel Tank</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(tank as any).name}</p>
      </div>
      <FuelTankForm
        tank={JSON.parse(JSON.stringify(tank))}
        branches={JSON.parse(JSON.stringify(branches))}
      />
    </div>
  )
}
