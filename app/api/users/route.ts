import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'

export async function GET(_req: NextRequest) {
  try {
    await connectDB()
    const users = await UserModel.find({ is_active: true })
      .select('name email role branch_id')
      .sort({ name: 1 })
      .lean()
    return NextResponse.json(users)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
