import { ArrowRight, Clock, Search, Filter, Sparkles } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { NewsCard } from '@/components/news'
import { mockNews } from '@/lib/mock-data'

export function LandingPage() {
  // Get 3 preview items
  const previewItems = mockNews.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-powered news summaries
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Know what's changing.
          <br />
          <span className="text-muted-foreground">Without reading everything.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          AI-summarized news in a timeline. Scan tech, science, and startup news in minutes, not hours. No login required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8" onClick={() => window.location.href = '/timeline'}>
            Go to Timeline
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8" onClick={() => window.location.href = '/components'}>
            View Components
          </Button>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Why upday?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Time-based, not algorithm-based"
              description="News sorted by when it happened. See what's new at a glance without algorithmic manipulation."
            />
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="AI summaries that matter"
              description="Every article gets a 2-3 line summary. Understand the news without clicking through."
            />
            <FeatureCard
              icon={<Filter className="h-6 w-6" />}
              title="Filter by what you care about"
              description="AI, Startup, Science, Design, Space, Dev. Focus on your domains without losing context."
            />
          </div>
        </div>
      </section>

      {/* Live Preview */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">See it in action</h2>
          <p className="text-muted-foreground text-center mb-8">
            Real news, updated continuously
          </p>
          <Card className="overflow-hidden">
            {previewItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
            <div className="p-4 text-center border-t border-border bg-muted/30">
              <a
                href="/timeline"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                View full timeline
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Step
              number={1}
              title="Open the timeline"
              description="No signup, no login. Just open and start scanning."
            />
            <Step
              number={2}
              title="Scan the summaries"
              description="Each card shows what happened and why it matters."
            />
            <Step
              number={3}
              title="Dive deeper if needed"
              description="Click through to the original article when you want the full story."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to stay informed?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of professionals who scan upday every morning.
          </p>
          <Button size="lg" className="text-base px-8" onClick={() => window.location.href = '/timeline'}>
            Start scanning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No account required. Ever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 upday. Built with React, Tailwind CSS, and AI.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div>
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
