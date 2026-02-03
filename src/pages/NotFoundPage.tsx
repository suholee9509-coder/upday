import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { SEO } from '@/components/SEO'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        url="/404"
      />
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Button>
          <Button variant="outline" onClick={() => navigate('/timeline')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            View Timeline
          </Button>
        </div>
      </div>
    </div>
  )
}
