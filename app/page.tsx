'use client'
import { useState, useEffect } from 'react'
import { Lead } from '@/lib/types'

const INDUSTRIES = [
  { val: 'Legal', label: 'Legal' },
  { val: 'Finance / CPA / Accounting', label: 'Finance / CPA' },
  { val: 'Real Estate', label: 'Real Estate' },
  { val: 'Healthcare / Medical', label: 'Healthcare' },
  { val: 'Insurance', label: 'Insurance' },
  { val: 'General SMB', label: 'General SMB' },
]

const LOG_STEPS = [
  'Reading your search parameters...',
  'Searching the web for real local businesses...',
  'Visiting company websites for verified data...',
  'Analyzing AI pain points per company...',
  'Scoring and ranking leads...',
  'Writing personalized cold emails...',
  'Saving results to database...',
]