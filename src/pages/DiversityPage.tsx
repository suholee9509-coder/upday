import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Globe, Layers, Scale } from 'lucide-react'
import { Button } from '@/components/ui'
import { SEO } from '@/components/SEO'

export function DiversityPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Diversity in Sources"
        description="Learn about our commitment to diverse news sources and balanced coverage at Upday."
        url="/diversity"
      />

      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft />
            Back to Home
          </Button>
        </div>
      </header>

      <main id="main-content" className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Diversity in Sources</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            We believe informed decisions require diverse perspectives.
            Here's how we approach source diversity at Upday.
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Multiple Sources, Multiple Views
            </h2>
            <p className="text-muted-foreground mb-4">
              We aggregate content from various tech publications, including both established
              outlets and specialized sources. This means you'll see coverage from different
              editorial perspectives on the same topics.
            </p>
            <p className="text-muted-foreground">
              When a major story breaks, you might see it covered by multiple sources,
              each with their own angle and analysis.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Geographic Coverage
            </h2>
            <p className="text-muted-foreground">
              Tech news happens globally. We include sources that cover developments in
              different regions, though our current focus is primarily on English-language
              publications. We're working to expand our coverage over time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Category Balance
            </h2>
            <p className="text-muted-foreground">
              We maintain six distinct categories to ensure coverage across different areas
              of tech: AI, Startups, Science, Space, Developer tools, and Design.
              Each category draws from sources relevant to that domain.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Editorial Independence
            </h2>
            <p className="text-muted-foreground mb-4">
              Upday does not create original content or editorial opinions.
              We present what sources publish without modification beyond AI summarization.
            </p>
            <p className="text-muted-foreground">
              Our timeline is chronological, not algorithmically ranked. We don't prioritize
              certain viewpoints or sources over others based on engagement or other metrics.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Source Suggestions</h2>
            <p className="text-muted-foreground">
              Know a source we should include? Send us a suggestion on our{' '}
              <Link to="/feedback" className="text-primary hover:underline">
                feedback page
              </Link>
              . We regularly review and add new sources.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
