import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchId = searchParams.get('searchId')

    const client = await clientPromise
    const db = client.db('leadscout')

    if (searchId) {
      const leads = await db.collection('leads')
        .find({ searchId })
        .sort({ score: -1 })
        .toArray()
      return NextResponse.json({ leads })
    } else {
      const searches = await db.collection('searches')
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray()
      return NextResponse.json({ searches })
    }
  } catch (error: any) {
    console.error('Search fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}