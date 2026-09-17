import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldAlert } from 'lucide-react'

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('manager.palace@omnihospitality.com')
  const [selectedRole, setSelectedRole] = useState<UserRole>('property_manager')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, selectedRole)
    if (selectedRole === 'shareholder') {
      navigate('/app/shareholder')
    } else if (selectedRole === 'chef_kitchen') {
      navigate('/app/kds')
    } else {
      navigate('/app/frontdesk')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Sign in to Console</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Authenticate using authorized enterprise identity.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          label="Corporate Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="name@omnihospitality.com"
        />

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Target Role Simulation
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="property_manager">Property Manager (Full Property Control)</option>
            <option value="front_desk">Front Desk Agent (Arrivals & Folios)</option>
            <option value="housekeeping">Housekeeping Lead (Room Status)</option>
            <option value="chef_kitchen">Executive Chef (Kitchen KDS)</option>
            <option value="restaurant_pos">F&B Captain (Restaurant POS)</option>
            <option value="president">President (Corporate Executive)</option>
            <option value="ceo">CEO (Corporate Executive)</option>
            <option value="shareholder">Shareholder (Strict Read-Only Portal)</option>
            <option value="security_gate">Gate Security (Visitor/Vehicle Log)</option>
            <option value="transport">Transport Dispatch (Fleet & Routes)</option>
            <option value="super_admin">Super Administrator (Global Access)</option>
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Select any role to simulate authorized screens and layout behavior.
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
        Sign In to Portal
      </Button>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
        <p className="font-semibold flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          Enterprise Multi-Tenant Environment
        </p>
        <p className="mt-1 text-[11px] opacity-90">
          All data requests are dynamically scoped to the selected organization and property.
        </p>
      </div>
    </form>
  )
}
