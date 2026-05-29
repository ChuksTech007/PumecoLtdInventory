import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const branch = await BranchModel.findById(id).lean()
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(branch)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await req.json()
    const branch = await BranchModel.findByIdAndUpdate(id, data, { new: true }).lean() as any
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('update', 'Branch', id, branch.name, `Updated branch ${branch.name}`)
    return NextResponse.json(branch)
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    // Soft delete via is_active = false (Branch has no deleted_at)
    const branch = await BranchModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean() as any
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('delete', 'Branch', id, branch.name, `Deactivated branch ${branch.name}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
