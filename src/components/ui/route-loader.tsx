import React from 'react'

export const RouteLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 text-center">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
        <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-indigo-500 border-r-indigo-400 animate-spin" />
        <div className="absolute w-4 h-4 rounded-full bg-indigo-500/80 shadow-lg shadow-indigo-500/50" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Omni Hospitality OS
        </p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Synchronizing workspace module...
        </p>
      </div>
    </div>
  )
}
