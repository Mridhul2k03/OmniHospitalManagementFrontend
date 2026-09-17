import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'

export const AccessDeniedView: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        Your current role (<span className="font-semibold text-foreground capitalize">{user?.role.replace(/_/g, ' ')}</span>)
        is not authorized to view or modify this operational domain according to the backend security policy.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/app/frontdesk">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
