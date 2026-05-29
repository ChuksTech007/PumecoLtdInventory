import { connectDB } from './db'
import ActivityLogModel from '@/models/ActivityLog'
import { headers } from 'next/headers'
import { auth } from '@/auth'

export async function logActivity(
  action: string,
  modelType: string,
  modelId: string,
  modelLabel: string,
  description: string,
  changes?: Record<string, any>
) {
  try {
    await connectDB()
    const session = await auth()
    const hdrs = await headers()

    await ActivityLogModel.create({
      user_id:     session?.user?.id,
      action,
      model_type:  modelType,
      model_id:    modelId,
      model_label: modelLabel,
      branch_id:   session?.user?.branch_id,
      description,
      changes:     changes ?? null,
      ip_address:  hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? 'unknown',
    })
  } catch {
    // Never let logging crash the app
  }
}
