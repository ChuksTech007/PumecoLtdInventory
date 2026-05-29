import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BranchModel from '@/models/Branch'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest) {
  try {
    await connectDB()
    const branches = await BranchModel.find({}).sort({ name: 1 }).lean()
    return NextResponse.json(branches)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const data = await req.json()
    const { name, code, location } = data
    if (!name || !code || !location) {
      return NextResponse.json({ error: 'name, code and location are required' }, { status: 400 })
    }
    const branch = await BranchModel.create(data)
    await logActivity('create', 'Branch', branch._id.toString(), branch.name, `Created branch ${branch.name}`)
    return NextResponse.json(branch, { status: 201 })
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
