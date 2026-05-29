import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import BranchModel from '@/models/Branch'
import ServiceForm from '../ServiceForm'

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ vehicle_id?: string }> }) {
  const params = await searchParams
  await connectDB()
  const [vehicles, branches] = await Promise.all([
    VehicleModel.find({ deleted_at: null, status: { $ne: 'decommissioned' } }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6"><h1 className="text-xl font-bold text-white">New Service Record</h1></div>
      <ServiceForm vehicles={JSON.parse(JSON.stringify(vehicles))} branches={JSON.parse(JSON.stringify(branches))} preselectedVehicleId={params.vehicle_id} />
    </div>
  )
}
