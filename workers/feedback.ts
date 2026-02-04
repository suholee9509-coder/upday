/**
 * Feedback API Worker
 * Receives feedback form submissions and sends via Resend
 */

interface Env {
  RESEND_API_KEY: string
  FEEDBACK_TO_EMAIL: string
}

interface FeedbackRequest {
  email: string
  message: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    try {
      const body: FeedbackRequest = await request.json()

      // Validate input
      if (!body.email || !body.message) {
        return new Response(JSON.stringify({ error: 'Email and message are required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        })
      }

      // Send email via Resend
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Upday Feedback <onboarding@resend.dev>',
          to: env.FEEDBACK_TO_EMAIL || 'suholee9509@gmail.com',
          subject: `[Upday Feedback] from ${body.email}`,
          html: `
            <h2>New Feedback from Upday</h2>
            <p><strong>From:</strong> ${body.email}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${body.message.replace(/\n/g, '<br />')}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">
              Sent from Upday Feedback Form at ${new Date().toISOString()}
            </p>
          `,
          reply_to: body.email,
        }),
      })

      if (!resendResponse.ok) {
        const error = await resendResponse.text()
        console.error('Resend API error:', error)
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        })
      }

      const result = await resendResponse.json()
      console.log('Email sent:', result)

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Error processing feedback:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }
  },
}
