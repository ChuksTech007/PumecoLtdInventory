import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import VehicleModel from '@/models/Vehicle'
import MileageLogModel from '@/models/MileageLog'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const record = await ServiceRecordModel.findOne({ _id: id, deleted_at: null })
      .populate('vehicle_id', 'registration_number make model')
      .populate('branch_id', 'name')
      .populate('created_by', 'name')
      .populate('approved_by', 'name')
      .lean()
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(record)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const session = await auth()
    const data = await req.json()

    const labour_cost = Number(data.labour_cost ?? 0)
    const parts_cost = Number(data.parts_cost ?? 0)
    const total_cost = labour_cost + parts_cost

    if (!data.branch_id) delete data.branch_id

    const record = await ServiceRecordModel.findByIdAndUpdate(
      id,
      { ...data, labour_cost, parts_cost, total_cost },
      { new: true }
    ).populate('vehicle_id', 'registration_number').lean() as any

    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If completed, update vehicle
    if (data.status === 'completed' && record.vehicle_id) {
      const vehicleId = (record.vehicle_id as any)._id ?? record.vehicle_id
      const vehicleUpdate: Record<string, any> = {
        status: 'active',
        last_service_date: record.completion_date ?? record.service_date,
      }
      if (record.mileage_at_service) vehicleUpdate.last_service_mileage = record.mileage_at_service
      if (record.next_service_mileage) vehicleUpdate.next_service_mileage = record.next_service_mileage

      await VehicleModel.findByIdAndUpdate(vehicleId, vehicleUpdate)

      // Create mileage log if mileage was recorded
      if (record.mileage_at_service) {
        await MileageLogModel.create({
          vehicle_id: vehicleId,
          mileage: record.mileage_at_service,
          source: 'service_record',
          source_id: id,
          recorded_by: session?.user?.id,
          notes: `Mileage at service ${record.reference_number}`,
        })
      }
    }

    // If in_progress, set vehicle to in_service
    if (data.status === 'in_progress' && record.vehicle_id) {
      const vehicleId = (record.vehicle_id as any)._id ?? record.vehicle_id
      await VehicleModel.findByIdAndUpdate(vehicleId, { status: 'in_service' })
    }

    await logActivity('update', 'ServiceRecord', id, record.reference_number, `Updated service record ${record.reference_number} to ${data.status}`)
    return NextResponse.json(record)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const record = await ServiceRecordModel.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true }).lean() as any
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('delete', 'ServiceRecord', id, record.reference_number, `Deleted service record ${record.reference_number}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
