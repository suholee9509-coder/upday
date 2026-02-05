#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const url = process.env.VITE_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(url, key)

async function check() {
  const now = new Date()

  // First get total count
  const { count } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })

  console.log('Total articles in DB:', count)

  // Get oldest article
  const { data: oldest } = await supabase
    .from('news_items')
    .select('published_at, title')
    .order('published_at', { ascending: true })
    .limit(1)

  if (oldest && oldest[0]) {
    console.log('Oldest article:', oldest[0].published_at, oldest[0].title?.slice(0, 50))
  }

  // Get all articles with pagination (Supabase default limit is 1000)
  let allData: any[] = []
  let page = 0
  const pageSize = 1000

  while (true) {
    const { data: pageData, error: pageError } = await supabase
      .from('news_items')
      .select('published_at, companies, category')
      .order('published_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (pageError) {
      console.error('Error:', pageError.message)
      return
    }

    if (!pageData || pageData.length === 0) break

    allData = allData.concat(pageData)
    page++

    if (pageData.length < pageSize) break
  }

  console.log('Fetched articles:', allData.length)

  const data = allData
  const error = null

  if (error) {
    console.error('Error:', error.message)
    return
  }

  const weekStats: Record<string, { total: number; withCompanies: number; ai: number; startups: number; dev: number }> = {}

  data.forEach(item => {
    const itemDate = new Date(item.published_at)
    const weekNum = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const weekKey = `Week-${weekNum}`

    if (!weekStats[weekKey]) {
      weekStats[weekKey] = { total: 0, withCompanies: 0, ai: 0, startups: 0, dev: 0 }
    }
    weekStats[weekKey].total++

    if (item.companies && item.companies.length > 0) {
      weekStats[weekKey].withCompanies++
    }

    if (item.category === 'ai') weekStats[weekKey].ai++
    if (item.category === 'startups') weekStats[weekKey].startups++
    if (item.category === 'dev') weekStats[weekKey].dev++
  })

  console.log('\n=== DB Stats by Week ===')
  Object.entries(weekStats)
    .sort((a, b) => parseInt(a[0].split('-')[1]) - parseInt(b[0].split('-')[1]))
    .slice(0, 15)
    .forEach(([week, stats]) => {
      console.log(`${week}: total=${stats.total}, withCompanies=${stats.withCompanies}, ai=${stats.ai}, startups=${stats.startups}, dev=${stats.dev}`)
    })

  // Show sample dates
  console.log('\n=== Sample Dates ===')
  const samples = data.filter((_, i) => i % 500 === 0).slice(0, 10)
  samples.forEach(item => {
    const d = new Date(item.published_at)
    const weekNum = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000))
    console.log(`${item.published_at} -> Week-${weekNum}`)
  })
}

check()
