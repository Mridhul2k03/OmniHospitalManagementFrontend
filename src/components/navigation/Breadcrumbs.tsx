import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app')

  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 px-6 py-2.5 text-xs text-muted-foreground border-b border-border/50 bg-background/50">
      <Link to="/app/frontdesk" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>HMS</span>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/app/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const formatted = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-semibold text-foreground">{formatted}</span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-colors">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
