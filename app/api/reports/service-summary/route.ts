import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ServiceRecordModel from '@/models/ServiceRecord'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const isAdmin = session?.user?.role === 'admin'
    const { searchParams } = new URL(req.url)

    const filter: Record<string, any> = { deleted_at: null }
    if (!isAdmin) filter.branch_id = session?.user?.branch_id
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

    if (searchParams.get('export') === 'csv') {
      const rows: string[] = []
      rows.push('Reference,Vehicle,Branch,Service Type,Status,Date,Labour Cost,Parts Cost,Total Cost')
      for (const r of records as any[]) {
        rows.push([
          r.reference_number,
          (r.vehicle_id as any)?.registration_number ?? '',
          (r.branch_id as any)?.name ?? '',
          r.service_type,
          r.status,
          new Date(r.service_date).toLocaleDateString(),
          r.labour_cost ?? 0,
          r.parts_cost ?? 0,
          r.total_cost ?? 0,
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      }
      const csv = rows.join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="service-summary.csv"',
        },
      })
    }

    return NextResponse.json(records)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
