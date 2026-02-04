import { ArrowRight, Sparkles, Clock, Zap, Globe } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Badge, ThemeToggle } from '@/components/ui'
import { NewsCard } from '@/components/news'
import { SEO } from '@/components/SEO'
import { UpdayWordmark } from '@/components/UpdayLogo'
import { mockNews } from '@/lib/mock-data'
import { CATEGORIES } from '@/lib/constants'

export function LandingPage() {
  const navigate = useNavigate()
  const previewItems = mockNews.slice(0, 3)

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <SEO url="/" />

      {/* Global flowing gradient - spans entire page */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient blob */}
        <div className="absolute -top-40 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-rose-100/60 via-violet-100/40 to-transparent dark:from-primary/[0.09] dark:via-primary/[0.05] rounded-full blur-3xl" />
        {/* Middle left blob */}
        <div className="absolute top-[500px] -left-40 w-[700px] h-[700px] bg-gradient-to-r from-amber-100/40 via-rose-100/30 to-transparent dark:from-muted/40 dark:via-muted/20 rounded-full blur-3xl" />
        {/* Middle right blob */}
        <div className="absolute top-[1200px] -right-40 w-[600px] h-[600px] bg-gradient-to-l from-violet-100/40 to-transparent dark:from-primary/[0.07] rounded-full blur-3xl" />
        {/* Large continuous blob - spans How It Works / Trusted Sources / Final CTA */}
        <div className="absolute top-[1400px] left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] bg-gradient-to-b from-amber-100/30 via-rose-100/25 to-violet-100/20 dark:from-muted/25 dark:via-primary/[0.04] dark:to-muted/15 rounded-full blur-3xl" />
      </div>

      {/* GNB */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <UpdayWordmark size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              size="sm"
              className="group"
              onClick={() => navigate('/timeline')}
            >
              Get started
              <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/80 backdrop-blur-sm text-xs font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground">Live updates every hour</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
                Know what's changing.
                <br />
                <span className="text-muted-foreground">Without reading everything.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                AI-summarized news in a timeline. Scan tech, science, and startup news in minutes, not hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="text-sm px-6 group"
                  onClick={() => navigate('/timeline')}
                >
                  Start reading
                  <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
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

              <p className="text-xs text-muted-foreground mt-6">
                Read less. Know more.
              </p>
            </div>

            {/* Right: Preview card */}
            <div className="relative">
              <div className="relative">

                <div className="relative overflow-hidden rounded-xl shadow-xl border border-border/50 bg-card">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">upday timeline</span>
                  </div>

                  <div className="divide-y divide-border">
                    {previewItems.map((item) => (
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

                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>

                <div className="absolute -top-3 -right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  AI Summary
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-12 relative bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/${cat.id}`}
                className="group"
              >
                <Badge
                  variant={cat.id as 'ai' | 'startups' | 'dev' | 'product' | 'research'}
                  className="px-4 py-2 text-sm font-medium transition-all hover:scale-105 hover:shadow-md cursor-pointer"
                >
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Browse by category
          </p>
        </div>
      </section>

      {/* Features - Bento grid */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Why upday?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              News, simplified.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Stop drowning in articles. Get the signal without the noise.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 group">
              <div className="relative h-full p-8 rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary/30">
                {/* Card gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-background to-violet-50/30 dark:from-muted/30 dark:via-card dark:to-muted/20" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">AI-powered summaries</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Every article gets a 2-3 line summary focused on what happened and why it matters.
                    Understand the news without clicking through.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground backdrop-blur-sm">
                      GPT-4 powered
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground backdrop-blur-sm">
                      Context-aware
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground backdrop-blur-sm">
                      No opinion
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Small cards */}
            <div className="space-y-4">
              <div className="group relative p-6 rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-4 border border-emerald-500/10">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Time-based feed</h3>
                  <p className="text-sm text-muted-foreground">
                    No algorithms. Just chronological news so you never miss what's new.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-4 border border-blue-500/10">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">40+ sources</h3>
                  <p className="text-sm text-muted-foreground">
                    Curated from the world's most trusted publications, updated hourly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Live
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              See what's happening now
            </h2>
            <p className="text-muted-foreground">
              Real news, real-time updates, zero noise
            </p>
          </div>

          {/* Floating preview with shadow layers */}
          <div className="relative">
            {/* Shadow layers for depth */}
            <div className="absolute inset-4 bg-foreground/5 rounded-2xl transform rotate-1" />
            <div className="absolute inset-2 bg-foreground/5 rounded-2xl transform -rotate-1" />

            {/* Main card */}
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full max-w-xs mx-auto px-3 py-1.5 rounded-md bg-background text-xs text-muted-foreground text-center">
                    upday.app/timeline
                  </div>
                </div>
              </div>

              {/* News cards */}
              <div className="divide-y divide-border">
                {previewItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>

              {/* Fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card via-card/80 to-transparent" />
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/timeline')}
              className="group"
            >
              View full timeline
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">3 steps</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple as it gets
            </h2>
          </div>

          {/* Steps with connecting line */}
          <div className="relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-16 left-[16.666%] right-[16.666%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {[
                { num: '1', title: 'Open', desc: 'No signup needed. Just visit and start reading.', color: 'rose' },
                { num: '2', title: 'Scan', desc: 'Title + summary tells you everything at a glance.', color: 'violet' },
                { num: '3', title: 'Dive', desc: 'Click through only when you want the full story.', color: 'amber' },
              ].map((step, i) => (
                <div key={i} className="relative text-center group">
                  {/* Number circle */}
                  <div className={`
                    relative z-10 w-12 h-12 mx-auto mb-6 rounded-full
                    bg-gradient-to-br ${step.color === 'rose' ? 'from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/10' : step.color === 'violet' ? 'from-violet-100 to-violet-50 dark:from-violet-500/20 dark:to-violet-500/10' : 'from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10'}
                    border border-border dark:border-border/50
                    flex items-center justify-center
                    shadow-sm group-hover:shadow-md transition-shadow
                  `}>
                    <span className={`text-lg font-bold ${step.color === 'rose' ? 'text-rose-600 dark:text-rose-400' : step.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {step.num}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Sources */}
      <section className="py-20 relative bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Live from 40+ sources
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Trusted sources, one feed
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Real-time aggregation from the world's most respected publications
            </p>
          </div>

          {/* Source chips - styled cards */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              'TechCrunch', 'Hacker News', 'The Verge', 'MIT Tech Review',
              'Wired', 'Ars Technica', 'BBC Tech', 'The Guardian',
              'NY Times', 'NASA', 'GitHub Blog', 'Dev.to',
              'VentureBeat', 'The Next Web', 'Reuters', 'Bloomberg'
            ].map((name) => (
              <span
                key={name}
                className="inline-flex items-center h-9 px-4 rounded-full text-sm font-medium bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-default"
              >
                {name}
              </span>
            ))}
            <span className="inline-flex items-center h-9 px-4 rounded-full text-sm text-muted-foreground bg-muted/30 border border-dashed border-border">
              +24 more
            </span>
          </div>

          {/* Stats - card style */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">1K+</div>
              <div className="text-xs text-muted-foreground">articles daily</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">5</div>
              <div className="text-xs text-muted-foreground">categories</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center justify-center gap-1">
                24/7
              </div>
              <div className="text-xs text-muted-foreground">live updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to stay informed?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of professionals who scan upday every morning.
          </p>
          <Button
            size="lg"
            className="text-base px-8 shadow-xl hover:shadow-2xl transition-shadow group"
            onClick={() => navigate('/timeline')}
          >
            Start reading — it's free
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            No account required. Ever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <UpdayWordmark size="sm" />
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://bsky.app/profile/updayapp.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Bluesky"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
              </svg>
            </a>
            <a
              href="https://discord.gg/GUkAsmpa"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Discord"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="https://t.me/updayapp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/feedback" className="hover:text-foreground transition-colors">Feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
