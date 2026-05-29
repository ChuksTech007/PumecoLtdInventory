import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import FuelDispensingModel from '@/models/FuelDispensing'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const isAdmin = session?.user?.role === 'admin'
    const { searchParams } = new URL(req.url)

    const receiptFilter: Record<string, any> = {}
    const dispensingFilter: Record<string, any> = {}
    if (!isAdmin) {
      receiptFilter.branch_id = session?.user?.branch_id
      dispensingFilter.branch_id = session?.user?.branch_id
    }
    const from = searchParams.get('from_date')
    const to = searchParams.get('to_date')
    if (from || to) {
      const dateFilter: Record<string, any> = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to)
      receiptFilter.receipt_date = dateFilter
      dispensingFilter.dispensing_date = dateFilter
    }

    const [receipts, dispensings] = await Promise.all([
      FuelReceiptModel.find(receiptFilter)
        .populate('fuel_tank_id', 'name tank_number')
        .populate('branch_id', 'name')
        .sort({ receipt_date: -1 })
        .lean(),
      FuelDispensingModel.find(dispensingFilter)
        .populate('fuel_tank_id', 'name tank_number')
        .populate('branch_id', 'name')
        .populate('vehicle_id', 'registration_number')
        .sort({ dispensing_date: -1 })
        .lean(),
    ])

    if (searchParams.get('export') === 'csv') {
      const rows: string[] = []
      rows.push('Type,Reference,Date,Tank,Branch,Vehicle/Purpose,Qty (L),Total Cost')
      for (const r of receipts as any[]) {
        rows.push([
          'Receipt',
          r.reference_number,
          new Date(r.receipt_date).toLocaleDateString(),
          `${(r.fuel_tank_id as any)?.name ?? ''} (${(r.fuel_tank_id as any)?.tank_number ?? ''})`,
          (r.branch_id as any)?.name ?? '',
          r.supplier_name ?? '',
          r.quantity_received,
          r.total_cost ?? '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      }
      for (const d of dispensings as any[]) {
        rows.push([
          'Dispensing',
          d.reference_number,
          new Date(d.dispensing_date).toLocaleDateString(),
          `${(d.fuel_tank_id as any)?.name ?? ''} (${(d.fuel_tank_id as any)?.tank_number ?? ''})`,
          (d.branch_id as any)?.name ?? '',
          (d.vehicle_id as any)?.registration_number ?? d.purpose,
          d.quantity_dispensed,
          '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      }
      const csv = rows.join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fuel-summary.csv"',
        },
      })
    }

    return NextResponse.json({ receipts, dispensings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
