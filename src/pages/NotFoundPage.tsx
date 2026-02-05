import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { SEO } from '@/components/SEO'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO
        title={t('notFound.title')}
        description={t('notFound.description')}
        url="/404"
      />
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('notFound.heading')}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t('notFound.message')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')}>
            <Home />
            {t('common.goHome')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/timeline')}>
            <ArrowLeft />
            {t('common.viewTimeline')}
          </Button>
        </div>
      </div>
    </div>
  )
}
