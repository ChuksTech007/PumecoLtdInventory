import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import BranchModel from '@/models/Branch'
import UserModel from '@/models/User'
import VehicleForm from '../../VehicleForm'
import { notFound } from 'next/navigation'

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [vehicle, branches, drivers] = await Promise.all([
    VehicleModel.findById(id).lean(),
    BranchModel.find({ is_active: true }).lean(),
    UserModel.find({ is_active: true }).lean(),
  ])
  if (!vehicle) notFound()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Edit Vehicle</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(vehicle as any).registration_number}</p>
      </div>
      <VehicleForm
        vehicle={JSON.parse(JSON.stringify(vehicle))}
        branches={JSON.parse(JSON.stringify(branches))}
        drivers={JSON.parse(JSON.stringify(drivers))}
      />
    </div>
  )
}
