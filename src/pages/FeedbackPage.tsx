import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SEO } from '@/components/SEO'
import { cn } from '@/lib/utils'

export function FeedbackPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!message) {
      newErrors.message = 'Message is required'
    } else if (message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('https://upday-feedback.suholee9509-98c.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }

      setSubmitted(true)
    } catch {
      setSubmitError('Failed to send feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Feedback Sent"
          description="Thank you for your feedback."
          url="/feedback"
        />

        <header className="border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft />
              Back to Home
            </Button>
          </div>
        </header>

        <main id="main-content" className="max-w-md mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Thank you!</h1>
          <p className="text-muted-foreground mb-8">
            Your feedback has been received. We appreciate you taking the time to help us improve.
          </p>
          <Button onClick={() => navigate('/timeline')}>
            Go to Timeline
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Feedback"
        description="Share your feedback about Upday. We'd love to hear from you."
        url="/feedback"
      />

      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft />
            Back to Home
          </Button>
        </div>
      </header>

      <main id="main-content" className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
            <CardDescription>
              Found a bug? Have a suggestion? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(errors.email && 'border-destructive')}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(
                    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed',
                    'disabled:opacity-50 resize-none',
                    errors.message && 'border-destructive'
                  )}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-sm text-destructive mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-destructive text-center">{submitError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          For urgent issues, please include details about your browser and device.
        </p>
      </main>
    </div>
  )
}
