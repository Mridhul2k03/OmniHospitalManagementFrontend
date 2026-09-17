import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTenant } from '@/context/useTenant'
import { useToast } from '@/components/ui/toast'
import { Building2, DollarSign, Save } from 'lucide-react'

export const SettingsHub: React.FC = () => {
  const { activeProperty, activeOrg } = useTenant()
  const { success } = useToast()

  const [propName, setPropName] = useState(activeProperty.name)
  const [checkInTime, setCheckInTime] = useState(activeProperty.checkInTime)
  const [checkOutTime, setCheckOutTime] = useState(activeProperty.checkOutTime)
  const [phone, setPhone] = useState(activeProperty.phone)
  const [email, setEmail] = useState(activeProperty.email)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success('Property Policies Saved', 'Updated operational check-in/out parameters and contact records.')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Property & System Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational policies, tax configuration, and property master parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Property Master Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Property Registered Name" value={propName} onChange={(e) => setPropName(e.target.value)} />
              <Input label="Property Code (PMS Code)" value={activeProperty.code} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Concierge Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Standard Check-In Time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
              <Input label="Standard Check-Out Time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>Financial & Tax Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">Base Currency:</span>
                <p className="font-mono font-bold text-foreground text-sm">{activeOrg.currency} (United States Dollar)</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">State Hotel Occupancy Tax:</span>
                <p className="font-mono font-bold text-foreground text-sm">8.875% Statutory</p>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block mb-1">City Hotel Unit Fee:</span>
                <p className="font-mono font-bold text-foreground text-sm">$1.50 / key / night</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
