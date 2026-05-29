import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import VehicleModel from '@/models/Vehicle'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'
import { generateRef } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const filter: Record<string, any> = { deleted_at: null }
    if (session?.user?.role !== 'admin') filter.branch_id = session?.user?.branch_id
    const branch = searchParams.get('branch')
    if (branch) filter.branch_id = branch
    const status = searchParams.get('status')
    if (status) filter.status = status
    const from = searchParams.get('from_date')
    const to = searchParams.get('to_date')
    if (from || to) {
      filter.service_date = {}
      if (from) filter.service_date.$gte = new Date(from)
      if (to) filter.service_date.$lte = new Date(to)
    }
    const records = await ServiceRecordModel.find(filter)
      .populate('vehicle_id', 'registration_number')
      .populate('branch_id', 'name')
      .sort({ service_date: -1 })
      .lean()
    return NextResponse.json(records)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const data = await req.json()
    const { vehicle_id, service_type, service_date, description } = data
    if (!vehicle_id || !service_type || !service_date || !description) {
      return NextResponse.json({ error: 'vehicle_id, service_type, service_date and description are required' }, { status: 400 })
    }

    const labour_cost = Number(data.labour_cost ?? 0)
    const parts_cost = Number(data.parts_cost ?? 0)
    const total_cost = labour_cost + parts_cost
    const reference_number = generateRef('SVC')

    if (!data.branch_id) delete data.branch_id

    const record = await ServiceRecordModel.create({
      ...data,
      reference_number,
      created_by: session?.user?.id,
      labour_cost,
      parts_cost,
      total_cost,
    })

    // If in_progress, update vehicle status
    if (data.status === 'in_progress') {
      await VehicleModel.findByIdAndUpdate(vehicle_id, { status: 'in_service' })
    }

    await logActivity('create', 'ServiceRecord', record._id.toString(), reference_number,
      `Created service record ${reference_number} for vehicle`)

    return NextResponse.json(record, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
