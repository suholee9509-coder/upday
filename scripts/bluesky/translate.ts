/**
 * Translation helper for Bluesky Korean auto-posting
 * Uses OpenAI GPT-4o-mini (~$0.11/month at 30 posts/day)
 */

import OpenAI from 'openai'

let openai: OpenAI | null = null

function getClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for Korean translation')
    }
    openai = new OpenAI({ apiKey })
  }
  return openai
}

/**
 * Translate a Bluesky post to Korean
 * Keeps hashtags, emojis, and proper nouns as-is
 */
export async function translatePostToKorean(post: string): Promise<string> {
  try {
    const client = getClient()

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Korean translator for a tech news social media account. Translate the post to natural Korean.

Rules:
- Keep all hashtags exactly as-is (e.g., #OpenAI, #Tech)
- Keep emojis as-is
- Keep company/product names in English (OpenAI, ChatGPT, Tesla, etc.)
- Translate the hook phrase and news title/description to Korean
- Use casual but informative tone (해요체 or 합니다체)
- Keep the same line break structure
- Do NOT add any extra text or explanation, just return the translated post`,
        },
        {
          role: 'user',
          content: post,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    })

    const translated = response.choices[0]?.message?.content?.trim()
    if (!translated) return post

    return translated
  } catch (error) {
    console.warn('[KR] Translation failed, using original:', error)
    return post
  }
}

/**
 * Check if translation is available (API key configured)
 */
export function isTranslationAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}
