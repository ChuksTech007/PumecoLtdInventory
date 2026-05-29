import { connectDB } from '@/lib/db'
import StaffModel from '@/models/Staff'
import BranchModel from '@/models/Branch'
import StaffForm from '../../StaffForm'
import { notFound } from 'next/navigation'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [member, branches] = await Promise.all([
    StaffModel.findOne({ _id: id, deleted_at: null }).lean(),
    BranchModel.find({ is_active: true }).sort({ name: 1 }).lean(),
  ])
  if (!member) notFound()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Edit Staff Member</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(member as any).full_name}</p>
      </div>
      <StaffForm
        member={JSON.parse(JSON.stringify(member))}
        branches={JSON.parse(JSON.stringify(branches))}
      />
    </div>
  )
}
