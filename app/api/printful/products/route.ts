import { NextResponse } from 'next/server'
import { getStoreProducts, getProductDetails } from '@/lib/printful'

const STORE_INPUT = process.env.NEXT_PUBLIC_PRINTFUL_STORE || 'orinowo.printful.com'
const DEFAULT_STORE_URL = STORE_INPUT.includes('.')
  ? `https://${STORE_INPUT}`
  : `https://${STORE_INPUT}.printful.me`

export async function GET() {
  try {
    if (!process.env.PRINTFUL_API_TOKEN) {
      // Token not configured; return empty list without calling Printful
      return NextResponse.json({ products: [] })
    }
    const products = await getStoreProducts()
    const storefrontBase = DEFAULT_STORE_URL

    // Fetch details to enrich pricing; limit to first 24 to keep response snappy
    const limited = (products || []).slice(0, 24)
    const detailsList = await Promise.all(
      limited.map(async (p: any) => {
        try {
          const details = await getProductDetails(String(p.id))
          return { id: p.id, details }
        } catch {
          return { id: p.id, details: null }
        }
      })
    )

    const detailsMap = new Map(detailsList.map((d) => [d.id, d.details]))

    const formattedProducts = limited.map((product: any) => {
      const details: any = detailsMap.get(product.id)
      const variant = details?.sync_variants?.[0]
      const price = variant?.retail_price ?? null
      const currency = variant?.currency ?? 'USD'
      const base = storefrontBase.replace(/\/$/, '')
      const isPrintfulMe = /\.printful\.me$/i.test(base)
      const path = isPrintfulMe ? 'product' : 'products'
      const url = `${base}/${path}/${product.id}`
      return {
        id: product.id,
        name: product.name,
        thumbnail: product.thumbnail_url,
        price,
        currency,
        url,
      }
    })
    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
