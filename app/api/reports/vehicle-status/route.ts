import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const isAdmin = session?.user?.role === 'admin'
    const { searchParams } = new URL(req.url)

    const filter: Record<string, any> = { deleted_at: null }
    if (!isAdmin) filter.branch_id = session?.user?.branch_id

    const vehicles = await VehicleModel.find(filter)
      .populate('branch_id', 'name')
      .sort({ registration_number: 1 })
      .lean()

    if (searchParams.get('export') === 'csv') {
      const rows: string[] = []
      rows.push('Reg Number,Fleet No,Make,Model,Year,Type,Status,Branch,Mileage,Last Service Date,Next Service Mileage,Insurance Expiry,Road Worthiness Expiry')
      for (const v of vehicles as any[]) {
        rows.push([
          v.registration_number,
          v.fleet_number ?? '',
          v.make,
          v.model,
          v.year ?? '',
          v.type,
          v.status,
          (v.branch_id as any)?.name ?? '',
          v.current_mileage ?? 0,
          v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : '',
          v.next_service_mileage ?? '',
          v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : '',
          v.road_worthiness_expiry ? new Date(v.road_worthiness_expiry).toLocaleDateString() : '',
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      }
      const csv = rows.join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="vehicle-status.csv"',
        },
      })
    }

    return NextResponse.json(vehicles)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
