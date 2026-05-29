import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import StaffModel from '@/models/Staff'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const filter: Record<string, any> = { deleted_at: null }
    if (session?.user?.role !== 'admin') filter.branch_id = session?.user?.branch_id
    const branch = searchParams.get('branch')
    if (branch) filter.branch_id = branch
    const search = searchParams.get('search')
    if (search) filter.$or = [
      { full_name: new RegExp(search, 'i') },
      { staff_number: new RegExp(search, 'i') },
      { designation: new RegExp(search, 'i') },
    ]
    const designation = searchParams.get('designation')
    if (designation) filter.designation = designation

    const staff = await StaffModel.find(filter)
      .populate('branch_id', 'name')
      .sort({ full_name: 1 })
      .lean()
    return NextResponse.json(staff)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const data = await req.json()
    const { full_name, staff_number, designation } = data
    if (!full_name || !staff_number || !designation) {
      return NextResponse.json({ error: 'full_name, staff_number and designation are required' }, { status: 400 })
    }
    if (!data.branch_id) delete data.branch_id
    const member = await StaffModel.create(data)
    await logActivity('create', 'Staff', member._id.toString(), member.full_name, `Created staff member ${member.full_name}`)
    return NextResponse.json(member, { status: 201 })
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Staff number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
