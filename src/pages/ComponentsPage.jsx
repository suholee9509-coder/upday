import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
} from '@/components/ui'

function DemoSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        {children}
      </div>
    </section>
  )
}

export function ComponentsPage() {
  const [inputValue, setInputValue] = useState('')

  return (
    <>
      <SEO title="Component Demo" noindex />
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-foreground">
            Monet Design
          </Link>
          <nav className="flex gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/components"
              className="text-sm font-medium text-foreground"
            >
              Components
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            컴포넌트 데모
          </h1>
          <p className="text-muted-foreground">
            Monet 테마 기반 UI 컴포넌트입니다. 프로젝트 전반에서 재사용할 수 있습니다.
          </p>
        </div>

        <div className="space-y-16">
          <DemoSection
            title="Button"
            description="variant: primary, secondary, ghost, destructive, outline / size: sm, default, lg, icon"
          >
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Icon button">
                <span className="text-lg">⚙</span>
              </Button>
            </div>
            <div className="mt-4">
              <Button disabled>Disabled</Button>
            </div>
          </DemoSection>

          <DemoSection
            title="Card"
            description="Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>카드 제목</CardTitle>
                  <CardDescription>카드 부가 설명입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    카드 본문. Monet 테마의 border, background가 적용됩니다.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm">
                    액션
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>강조 카드</CardTitle>
                  <CardDescription>border-primary/20로 강조할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    동일한 Card 컴포넌트에 className으로 스타일을 덧씌울 수 있습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </DemoSection>

          <DemoSection
            title="Input"
            description="placeholder, disabled, type 등 표준 input 속성 지원"
          >
            <div className="space-y-4 max-w-sm">
              <Input
                placeholder="Placeholder"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input placeholder="Disabled" disabled />
              <Input type="email" placeholder="email@example.com" />
              <Input type="password" placeholder="Password" />
            </div>
          </DemoSection>

          <DemoSection
            title="Badge"
            description="variant: default, secondary, destructive, outline, muted"
          >
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="muted">Muted</Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              상태 표시, 라벨, 카운트 등에 사용할 수 있습니다.
            </p>
          </DemoSection>
        </div>
      </main>
      </div>
    </>
  )
}
