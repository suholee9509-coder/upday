/**
 * Generate OG Image (PNG) from SVG
 * Usage: npx tsx scripts/generate-og-image.ts
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.resolve(__dirname, '../public/og-image.svg')
const pngPath = path.resolve(__dirname, '../public/og-image.png')

async function generateOgImage() {
  console.log('Generating OG image...')

  const svgContent = fs.readFileSync(svgPath, 'utf-8')

  await sharp(Buffer.from(svgContent))
    .resize(1200, 630)
    .png()
    .toFile(pngPath)

  console.log(`✅ Generated: ${pngPath}`)
}

generateOgImage().catch(console.error)
