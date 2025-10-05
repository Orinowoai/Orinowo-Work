import type { NextApiRequest, NextApiResponse } from 'next'

let activeRequests = 0
let totalLatency = 0
let successCount = 0
let totalRequests = 0

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // These are simple in-memory counters; for multi-instance, back with a shared store
  const averageLatency = totalRequests > 0 ? totalLatency / totalRequests : 0
  const successRate = totalRequests > 0 ? successCount / totalRequests : 0

  return res.status(200).json({
    uptime: process.uptime(),
    activeRequests,
    averageLatency,
    successRate,
  })
}

// Optional hooks: you can import and use these in APIs to track request lifecycle
export function trackRequestStart() { activeRequests++ }
export function trackRequestEnd(latencyMs: number, success: boolean) {
  activeRequests = Math.max(0, activeRequests - 1)
  totalRequests++
  totalLatency += latencyMs
  if (success) successCount++
}
