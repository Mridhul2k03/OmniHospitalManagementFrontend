import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import {
  UserCheck,
  UploadCloud,
  CheckCircle2,
  PenTool,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'

export const DigitalCheckInView: React.FC = () => {
  const { success } = useToast()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form states
  const [firstName, setFirstName] = useState('Lord Sterling')
  const [lastName, setLastName] = useState('Crawford')
  const [email, setEmail] = useState('crawford@estates.uk')
  const [phone, setPhone] = useState('+44 20 7946 0912')
  const [idType, setIdType] = useState('passport')
  const [idNumber, setIdNumber] = useState('GB9821884')
  const [hasUploadedId, setHasUploadedId] = useState(true)
  const [emergencyName, setEmergencyName] = useState('Lady Margaret Crawford')
  const [emergencyPhone, setEmergencyPhone] = useState('+44 20 7946 0910')
  const [hasSignature, setHasSignature] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleNextStep = () => {
    if (step < 4) setStep((prev) => (prev + 1) as any)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any)
  }

  const handleFinalizeCheckIn = () => {
    setIsCompleted(true)
    success(
      'Digital Pre-Arrival Check-In Completed',
      'Digital keycard mobile pass issued and registration card filed.'
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-2">
          <UserCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Contactless Digital Check-In</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fast-track guest registration & digital room keycard provisioner
        </p>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="flex items-center justify-between px-6">
        {[
          { num: 1, label: 'Guest Details' },
          { num: 2, label: 'Identity ID' },
          { num: 3, label: 'Emergency Contact' },
          { num: 4, label: 'Digital Sign' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs transition-colors ${
                step === s.num
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Stepper Content */}
      <Card className="p-6">
        {isCompleted ? (
          <div className="py-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">You Are All Set, {firstName}!</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your digital registration is verified and Room 501 (Penthouse Suite) is allocated.
              Your mobile keycard pass has been dispatched to {email}.
            </p>
            <div className="pt-4">
              <Button onClick={() => setStep(1)} variant="outline">
                Register Another Guest
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {step === 1 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-base text-foreground">Step 1: Confirm Primary Guest Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input label="Mobile Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-base text-foreground">Step 2: Legal Identity Verification</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Identification Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="passport">International Passport</option>
                      <option value="driver_license">State Driver's License</option>
                      <option value="national_id">National ID Card</option>
                    </select>
                  </div>
                  <Input label="Document ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                </div>

                <div
                  onClick={() => setHasUploadedId(!hasUploadedId)}
                  className="rounded-xl border-2 border-dashed border-border p-6 text-center bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-semibold text-foreground">
                    {hasUploadedId ? 'Passport Photo Document Captured' : 'Click to Upload Passport / ID Document'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    passport_gb_crawford.pdf • 1.8 MB (Verified Secure OCR)
                  </p>
                  <Badge variant={hasUploadedId ? 'success' : 'outline'} className="mt-2">
                    {hasUploadedId ? 'Signed Cloud Storage Encrypted' : 'Pending Upload'}
                  </Badge>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-base text-foreground">Step 3: Emergency Contact & Preferences</h3>
                <Input
                  label="Emergency Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
                <Input
                  label="Emergency Contact Telephone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-base text-foreground">Step 4: Digital Registration Card Signature</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By signing below, I agree to the hotel guest terms, room damages policy, and authorization of incidental charges to my credit card on file.
                </p>

                <div
                  onClick={() => setHasSignature(true)}
                  className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-muted/10 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {hasSignature ? (
                    <div className="space-y-1">
                      <p className="font-serif italic text-2xl text-primary font-bold">Lord S. Crawford</p>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        Digitally Signed on {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <PenTool className="h-6 w-6" />
                      <span className="font-medium">Tap here to sign guest registration agreement</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              {step > 1 ? (
                <Button variant="outline" size="sm" onClick={handlePrevStep} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button size="sm" onClick={handleNextStep} className="gap-1">
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                  onClick={handleFinalizeCheckIn}
                  disabled={!hasSignature}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize Pre-Arrival Check-In
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
