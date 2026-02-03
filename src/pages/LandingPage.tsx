import { ArrowRight, Clock, Search, Filter } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { NewsCard } from '@/components/news'
import { SEO } from '@/components/SEO'
import { mockNews } from '@/lib/mock-data'

export function LandingPage() {
  const navigate = useNavigate()
  // Get 3 preview items
  const previewItems = mockNews.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <SEO url="/" />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.1),transparent)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-[1560px] mx-auto px-5 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/80 backdrop-blur-sm text-xs font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground">Live updates every hour</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
                Know what's changing.
                <br />
                <span className="text-muted-foreground">Without reading everything.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                AI-summarized news in a timeline. Scan tech, science, and startup news in minutes, not hours.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="text-sm px-6"
                  onClick={() => navigate('/timeline')}
                >
                  Start reading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-sm text-muted-foreground"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Learn more
                </Button>
              </div>

              {/* Tagline */}
              <p className="text-xs text-muted-foreground mt-6">
                Read less. Know more.
              </p>
            </div>

            {/* Right: Floating preview card */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Glow effect behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-2xl" />

                {/* Preview card */}
                <Card className="relative overflow-hidden shadow-xl border-border/50">
                  {/* Card header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">upday timeline</span>
                  </div>

                  {/* Preview news items */}
                  <div className="divide-y divide-border">
                    {previewItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-1 h-12 rounded-full bg-primary/20" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">{item.source}</p>
                            <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fade overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </Card>

                {/* Floating badges */}
                <div className="absolute -top-3 -right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  AI Summary
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="bg-muted/30 py-16 border-y border-border">
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
              <Link
                to="/timeline"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                View full timeline
                <ArrowRight className="h-4 w-4" />
              </Link>
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
          <Button size="lg" className="text-base px-8" onClick={() => navigate('/timeline')}>
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
