import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import StaffModel from '@/models/Staff'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const member = await StaffModel.findOne({ _id: id, deleted_at: null })
      .populate('branch_id', 'name')
      .lean()
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(member)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await req.json()
    if (!data.branch_id) delete data.branch_id
    const member = await StaffModel.findByIdAndUpdate(id, data, { new: true }).lean() as any
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('update', 'Staff', id, member.full_name, `Updated staff ${member.full_name}`)
    return NextResponse.json(member)
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Staff number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const member = await StaffModel.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true }).lean() as any
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('delete', 'Staff', id, member.full_name, `Deleted staff ${member.full_name}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
