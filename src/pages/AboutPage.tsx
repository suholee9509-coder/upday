import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Newspaper, Cpu, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui'
import { SEO } from '@/components/SEO'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About"
        description="Learn about Upday - an AI-powered tech news aggregator that delivers summarized news in real-time."
        url="/about"
      />

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">About Upday</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Upday is a tech news aggregator that uses AI to summarize articles from multiple sources,
            helping you stay informed without spending hours reading.
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              What We Do
            </h2>
            <p className="text-muted-foreground mb-4">
              We aggregate news from trusted tech publications across six categories:
              AI, Startups, Science, Space, Developer, and Design. Each article is processed
              through AI to generate concise summaries that capture the key information.
            </p>
            <p className="text-muted-foreground">
              Our goal is simple: help you understand what's happening in tech without
              the time commitment of reading full articles for every story.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              How AI Summarization Works
            </h2>
            <p className="text-muted-foreground mb-4">
              We use large language models to generate 2-3 sentence summaries of each article.
              The AI extracts the most important facts and context while preserving accuracy.
            </p>
            <p className="text-muted-foreground">
              AI summaries are not perfect. We always link to the original source so you can
              read the full article when you need complete details.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timeline-First Approach
            </h2>
            <p className="text-muted-foreground">
              News is displayed chronologically, not algorithmically. We don't use engagement
              metrics or personalization to rank stories. What's new appears first,
              giving you an unfiltered view of recent developments.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Our Sources
            </h2>
            <p className="text-muted-foreground mb-4">
              We pull from established tech publications and news outlets. Source attribution
              is always displayed, and we link directly to original articles.
            </p>
            <p className="text-muted-foreground">
              We don't host original content. Upday is a discovery tool that helps you find
              news you might otherwise miss.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Questions or feedback? Visit our{' '}
              <Link to="/feedback" className="text-primary hover:underline">
                feedback page
              </Link>{' '}
              to get in touch.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
