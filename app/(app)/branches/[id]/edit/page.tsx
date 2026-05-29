import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import BranchForm from '../../BranchForm'
import { notFound } from 'next/navigation'

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const branch = await BranchModel.findById(id).lean()
  if (!branch) notFound()
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Edit Branch</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(branch as any).name}</p>
      </div>
      <BranchForm branch={JSON.parse(JSON.stringify(branch))} />
    </div>
  )
}
