import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ status: 'error', error: 'Background status not supported in this mode' }, { status: 400 })
}
