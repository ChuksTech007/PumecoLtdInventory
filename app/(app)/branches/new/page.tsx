import BranchForm from '../BranchForm'

export default function NewBranchPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Add Branch</h1>
        <p className="text-sm text-gray-500 mt-0.5">Register a new company branch</p>
      </div>
      <BranchForm />
    </div>
  )
}
