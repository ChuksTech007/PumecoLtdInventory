import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import VehicleModel from '@/models/Vehicle'
import BranchModel from '@/models/Branch'
import ServiceForm from '../../ServiceForm'
import { notFound } from 'next/navigation'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [record, vehicles, branches] = await Promise.all([
    ServiceRecordModel.findById(id).lean(),
    VehicleModel.find({ deleted_at: null }).lean(),
    BranchModel.find({ is_active: true }).lean(),
  ])
  if (!record) notFound()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6"><h1 className="text-xl font-bold text-white">Edit Service Record</h1></div>
      <ServiceForm record={JSON.parse(JSON.stringify(record))} vehicles={JSON.parse(JSON.stringify(vehicles))} branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  )
}
