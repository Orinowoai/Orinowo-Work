import axios from 'axios'

const printfulClient = axios.create({
  baseURL: 'https://api.printful.com',
  headers: {
    Authorization: `Bearer ${process.env.PRINTFUL_API_TOKEN || ''}`,
    'Content-Type': 'application/json',
  },
})

export async function getStoreProducts() {
  try {
    const response = await printfulClient.get('/store/products')
    return response.data.result || []
  } catch (error) {
    console.error('Printful API error:', error)
    return []
  }
}

export async function getProductDetails(productId: string) {
  try {
    const response = await printfulClient.get(`/store/products/${productId}`)
    return response.data.result
  } catch (error) {
    console.error('Printful product error:', error)
    return null
  }
}

export async function getStoreInfo() {
  try {
    const response = await printfulClient.get('/store')
    return response.data.result
  } catch (error) {
    console.error('Printful store info error:', error)
    return null
  }
}
