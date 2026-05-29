import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import BranchModel from '@/models/Branch'
import bcrypt from 'bcryptjs'

const BRANCHES = [
  { name: 'Head Office', code: 'HQ', location: 'Abuja', state: 'FCT', address: '1 Central Business District, Abuja' },
  { name: 'Lagos Branch', code: 'LGB', location: 'Lagos', state: 'Lagos', address: '15 Victoria Island, Lagos' },
  { name: 'Port Harcourt Branch', code: 'PHB', location: 'Port Harcourt', state: 'Rivers', address: '8 Trans-Amadi Road, Port Harcourt' },
  { name: 'Kano Branch', code: 'KNB', location: 'Kano', state: 'Kano', address: '22 Ibrahim Taiwo Road, Kano' },
]

export async function GET() {
  try {
    await connectDB()

    const existing = await UserModel.findOne({ email: 'admin@pumeco.com' })
    if (existing) {
      return NextResponse.json({ message: 'Already seeded', seeded: false })
    }

    // Create branches
    const branches = await BranchModel.insertMany(BRANCHES)
    const [hq, lagos, ph, kano] = branches

    const password = await bcrypt.hash('password123', 10)

    const users = [
      { name: 'Super Admin', email: 'admin@pumeco.com', password, role: 'admin', branch_id: hq._id, is_active: true },
      // HQ
      { name: 'John Fleet HQ', email: 'fleet.hq@pumeco.com', password, role: 'fleet_officer', branch_id: hq._id, is_active: true },
      { name: 'Mary Fuel HQ', email: 'fuel.hq@pumeco.com', password, role: 'fuel_officer', branch_id: hq._id, is_active: true },
      { name: 'Peter Manager HQ', email: 'manager.hq@pumeco.com', password, role: 'branch_manager', branch_id: hq._id, is_active: true },
      // Lagos
      { name: 'Emeka Fleet Lagos', email: 'fleet.lagos@pumeco.com', password, role: 'fleet_officer', branch_id: lagos._id, is_active: true },
      { name: 'Ngozi Fuel Lagos', email: 'fuel.lagos@pumeco.com', password, role: 'fuel_officer', branch_id: lagos._id, is_active: true },
      { name: 'Chidi Manager Lagos', email: 'manager.lagos@pumeco.com', password, role: 'branch_manager', branch_id: lagos._id, is_active: true },
      // Port Harcourt
      { name: 'Femi Fleet PH', email: 'fleet.ph@pumeco.com', password, role: 'fleet_officer', branch_id: ph._id, is_active: true },
      { name: 'Amaka Fuel PH', email: 'fuel.ph@pumeco.com', password, role: 'fuel_officer', branch_id: ph._id, is_active: true },
      { name: 'Tunde Manager PH', email: 'manager.ph@pumeco.com', password, role: 'branch_manager', branch_id: ph._id, is_active: true },
      // Kano
      { name: 'Musa Fleet Kano', email: 'fleet.kano@pumeco.com', password, role: 'fleet_officer', branch_id: kano._id, is_active: true },
      { name: 'Fatima Fuel Kano', email: 'fuel.kano@pumeco.com', password, role: 'fuel_officer', branch_id: kano._id, is_active: true },
      { name: 'Ibrahim Manager Kano', email: 'manager.kano@pumeco.com', password, role: 'branch_manager', branch_id: kano._id, is_active: true },
    ]

    await UserModel.insertMany(users)

    return NextResponse.json({
      message: 'Seeded successfully. 4 branches and 13 users created. Default password: password123',
      seeded: true,
      branches: branches.map(b => ({ name: b.name, code: b.code })),
      userCount: users.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
