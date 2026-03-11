import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import clientPromise from '@/lib/mongodb'
import { Lead, LeadSearch } from '@/lib/types'
import { randomUUID } from 'crypto'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function buildPrompt(city: string, num: string, industries: string[], size: string, service: string, extra: string): string {
  return `You are a sales intelligence researcher. Use web search to find ${num} REAL local businesses in ${city} in these industries: ${industries.join(', ')}.

Target company size: ${size}.
The seller is pitching: ${service}.
${extra ? `Extra context: ${extra}` : ''}

CRITICAL RULES:
1. Every company MUST be a real business with a real website you have searched and confirmed exists.
2. Use web search to find actual companies, then fetch their websites to get real verified data.
3. NEVER invent company names, phone numbers, addresses, or contact names.
4. Clearly label each data point as VERIFIED (from their website) or INFERRED (your analysis).
5. Phone numbers and addresses must come from their actual website.
6. Search for "[industry] firms ${city}" to find real options for each industry.

For each company, search their website to pull real contact info, staff names, and practice/service areas.

Return ONLY a valid JSON array with NO text before or after it. Structure:

[
  {
    "name": "Exact company name",
    "industry": "legal|finance|smb|healthcare|insurance|realestate",
    "industryLabel": "Human readable label e.g. Legal, Finance / CPA",
    "size": "What you found on their site or reasonable estimate",
    "model": "1-2 sentence description of what they do",
    "address": "Real address from their website or null",
    "phone": "Real phone from their website or null",
    "website": "Their actual full URL",
    "keyContact": "Real person name from website or null",
    "keyContactTitle": "Their title or null",
    "score": 72,
    "tier": "hot|warm|lukewarm",
    "trigger": "One specific real reason why NOW is a good time to reach out",
    "pains": [
      {
        "title": "Specific pain point",
        "severity": "high|med|low",
        "note": "Why this applies to them specifically based on what you found",
        "source": "verified|inferred"
      }
    ],
    "scores": [
      { "dim": "AI Readiness", "pts": 15, "max": 20 },
      { "dim": "Pain Intensity", "pts": 16, "max": 20 },
      { "dim": "Budget Signal", "pts": 14, "max": 20 },
      { "dim": "Decision Access", "pts": 15, "max": 20 },
      { "dim": "Timing", "pts": 12, "max": 20 }
    ],
    "emailSubject": "Compelling specific cold email subject line",
    "emailBody": "Full cold email body under 150 words. Personalized hook referencing something real. Specific AI solution. Low-friction CTA. End with [Your Name] placeholder.",
    "sourceNote": "What you specifically verified from their website"
  }
]

Search thoroughly. Real companies only. Return ONLY the JSON array, nothing else.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, num, industries, size, service, extra } = body

    if (!city || !industries?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = buildPrompt(city, num || '5', industries, size, service, extra || '')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')

    if (!textContent.trim()) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    let leads: any[]
    try {
      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)```/) || textContent.match(/(\[[\s\S]*\])/)
      if (jsonMatch) {
        leads = JSON.parse(jsonMatch[1])
      } else {
        const start = textContent.indexOf('[')
        const end = textContent.lastIndexOf(']') + 1
        leads = JSON.parse(textContent.slice(start, end))
      }
    } catch {
      console.error('Parse error. Raw response:', textContent.slice(0, 500))
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }

    const searchId = randomUUID()
    const now = new Date()

    try {
      const client = await clientPromise
      const db = client.db('leadscout')

      const searchRecord: LeadSearch = {
        searchId, city, industries,
        companySize: size, aiService: service,
        extraContext: extra || '', leadCount: leads.length, createdAt: now,
      }
      await db.collection('searches').insertOne(searchRecord)

      const leadsToInsert: Lead[] = leads.map(lead => ({ ...lead, searchId, city, industries, createdAt: now }))
      await db.collection('leads').insertMany(leadsToInsert)

      console.log(`Saved search ${searchId} with ${leads.length} leads to MongoDB`)
    } catch (dbError) {
      console.error('MongoDB save error:', dbError)
    }

    return NextResponse.json({ leads, searchId })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}