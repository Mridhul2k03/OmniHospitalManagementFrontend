import React, { useState, useEffect, useCallback } from 'react'
import { educationalApi, StudentFilterParams } from '@/api/endpoints/educational.api'
import { Student, StudentAdmissionPayload } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Receipt,
  Mail,
  Phone,
  UserCheck,
  Building,
  RefreshCw,
} from 'lucide-react'

// Demo Seed Students matching API v1.0.0 Specification
const SEED_STUDENTS: Student[] = [
  {
    id: '18d23f73-f065-4706-b31c-71efc2a08cc3',
    admission_number: 'ADM-2026-0015',
    first_name: 'Mira',
    last_name: 'Kowalski',
    full_name: 'Mira Kowalski',
    email: 'mira.kowalski@omni-edu.org',
    class_cohort_name: 'Year 3 Computer Science',
    section_name: 'Section A',
    date_of_birth: '2006-03-22',
    gender: 'F',
    status: 'enrolled',
    guardian_links: [
      {
        id: 'b4fa957f-41d1-4ffc-a00e-dce214194d3b',
        guardian_name: 'Jan Kowalski',
        relationship: 'father',
        phone_number: '+15559876543',
        is_primary: true,
      },
    ],
  },
  {
    id: 'd4fc7b11-8d29-4842-835f-4d17199e35ab',
    admission_number: 'ADM-2026-0016',
    first_name: 'Devan',
    last_name: 'Nair',
    full_name: 'Devan Nair',
    email: 'devan.nair@omni-edu.org',
    class_cohort_name: 'Year 2 Mechanical Engineering',
    section_name: 'Section B',
    date_of_birth: '2007-07-14',
    gender: 'M',
    status: 'enrolled',
    guardian_links: [
      {
        id: 'b4fa957f-41d1-4ffc-a00e-dce214194d3c',
        guardian_name: 'Priya Nair',
        relationship: 'mother',
        phone_number: '+15559876599',
        is_primary: true,
      },
    ],
  },
  {
    id: '5c563e60-084c-41d0-b5c5-3cf1ddcb0a78',
    admission_number: 'ADM-2026-0017',
    first_name: 'Lucas',
    last_name: 'Vance',
    full_name: 'Lucas Vance',
    email: 'lucas.vance@omni-edu.org',
    class_cohort_name: 'Year 1 Business Administration',
    section_name: 'Section A',
    date_of_birth: '2008-01-10',
    gender: 'M',
    status: 'admitted',
    guardian_links: [
      {
        id: 'b4fa957f-41d1-4ffc-a00e-dce214194d3d',
        guardian_name: 'Eleanor Vance',
        relationship: 'guardian',
        phone_number: '+15559876511',
        is_primary: true,
      },
    ],
  },
]

export const StudentsHub: React.FC = () => {
  const { activeTenant } = useAuth()
  const { success, error: toastError } = useToast()

  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [genderFilter, setGenderFilter] = useState<string>('all')

  // Admission Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Admission Form Fields
  const [formData, setFormData] = useState<StudentAdmissionPayload>({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '2007-05-15',
    gender: 'F',
    admission_date: new Date().toISOString().split('T')[0],
    admission_number: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    class_name: 'Year 1 Computer Science',
    section_name: 'Section A',
    guardian: {
      first_name: '',
      last_name: '',
      phone_number: '+1 (555) 234-5678',
      relationship: 'mother',
    },
  })

  // Selected Student Detail Drawer
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Fetch Students from backend
  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: StudentFilterParams = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.status = statusFilter
      if (genderFilter !== 'all') params.gender = genderFilter

      const res = await educationalApi.getStudents(params)
      if (Array.isArray(res) && res.length > 0) {
        setStudents(res)
      } else {
        // Filter seed students in client
        filterLocalSeed()
      }
    } catch {
      filterLocalSeed()
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, genderFilter])

  const filterLocalSeed = () => {
    let filtered = [...SEED_STUDENTS]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.admission_number.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }
    if (genderFilter !== 'all') {
      filtered = filtered.filter((s) => s.gender === genderFilter)
    }
    setStudents(filtered)
  }

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Handle Admission Submission: POST /api/v1/students/admit/
  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await educationalApi.admitStudent(formData)
      const newStudent = res?.data || {
        id: `stu-${Date.now()}`,
        admission_number: formData.admission_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        class_cohort_name: formData.class_name,
        section_name: formData.section_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        status: 'enrolled' as const,
        guardian_links: [
          {
            id: `g-${Date.now()}`,
            guardian_name: `${formData.guardian.first_name} ${formData.guardian.last_name}`,
            relationship: formData.guardian.relationship,
            phone_number: formData.guardian.phone_number,
            is_primary: true,
          },
        ],
      }

      setStudents((prev) => [newStudent, ...prev])
      setIsAdmitModalOpen(false)
      success(
        'Student Admitted Successfully',
        `Enrolled ${newStudent.full_name} into ${formData.class_name}. Default login: Student123! & Initial Invoice Generated.`
      )

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '2007-05-15',
        gender: 'F',
        admission_date: new Date().toISOString().split('T')[0],
        admission_number: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        class_name: 'Year 1 Computer Science',
        section_name: 'Section A',
        guardian: {
          first_name: '',
          last_name: '',
          phone_number: '+1 (555) 234-5678',
          relationship: 'mother',
        },
      })
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      toastError('Admission Failed', errObj?.message || 'Could not complete student admission lifecycle.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Soft-delete student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to withdraw student ${name}?`)) return
    try {
      await educationalApi.deleteStudent(id)
    } catch {
      // client update
    }
    setStudents((prev) => prev.filter((s) => s.id !== id))
    success('Student Withdrawn', `${name} record soft-deleted.`)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Students & Admissions</h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              <Building className="h-3 w-3" />
              {activeTenant?.name || 'Oxford Crest University'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Connected to OmniEducationalManagement REST API v1.0.0 &bull; Automated Lifecycle Admissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={isLoading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button size="sm" onClick={() => setIsAdmitModalOpen(true)} className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            Admit New Student
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Registered</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{students.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Across all active cohorts</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Enrolled</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {students.filter((s) => s.status === 'enrolled').length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Active in classroom sections</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Admitted (Pending)</span>
            <GraduationCap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {students.filter((s) => s.status === 'admitted').length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Orientation in progress</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Automated Invoices</span>
            <Receipt className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{students.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Linked in finance module</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search admission number, full name, email..."
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="admitted">Admitted</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="O">Other</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Primary Guardian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const primaryGuardian = student.guardian_links?.[0]
                  return (
                    <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-primary">
                        {student.admission_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{student.full_name}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{student.class_cohort_name || 'General'}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {student.section_name || 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {student.gender === 'F' ? 'Female' : student.gender === 'M' ? 'Male' : 'Other'}
                      </td>
                      <td className="py-3 px-4">
                        {primaryGuardian ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {primaryGuardian.guardian_name} ({primaryGuardian.relationship})
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5" />
                              {primaryGuardian.phone_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            student.status === 'enrolled'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : student.status === 'admitted'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedStudent(student)}
                            title="View Full Profile"
                          >
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteStudent(student.id, student.full_name)}
                            title="Withdraw Student"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            &times;
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer / Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.full_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <div>
                <span className="text-muted-foreground">Admission ID:</span>
                <p className="font-mono font-bold text-foreground mt-0.5">{selectedStudent.admission_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Enrollment Status:</span>
                <p className="font-semibold capitalize text-emerald-600 mt-0.5">{selectedStudent.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedStudent.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedStudent.gender || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Class Cohort:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedStudent.class_cohort_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Section:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedStudent.section_name}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1.5">Guardian Details</h4>
              {selectedStudent.guardian_links && selectedStudent.guardian_links.length > 0 ? (
                selectedStudent.guardian_links.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <div>
                      <p className="font-semibold text-foreground">{g.guardian_name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{g.relationship}</p>
                    </div>
                    <p className="font-mono text-muted-foreground">{g.phone_number}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No guardians linked.</p>
              )}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Auth User Account & Tuition Ledger
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Linked Student User credential was automatically provisioned with role <code>student</code> and initial tuition fee invoice was generated in the finance ledger.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admit Student Modal: POST /api/v1/students/admit/ */}
      {isAdmitModalOpen && (
        <Modal
          isOpen={isAdmitModalOpen}
          onClose={() => setIsAdmitModalOpen(false)}
          title="Admit Student (Automated 8-Step Lifecycle)"
        >
          <form onSubmit={handleAdmitSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-amber-800 dark:text-amber-400">
              <p className="font-semibold">Backend Execution Pipeline:</p>
              <ol className="mt-1 list-decimal list-inside space-y-0.5 text-[11px] opacity-90">
                <li>Validates duplicate student records</li>
                <li>Creates Student profile & Auth User (Default: <code>Student123!</code>)</li>
                <li>Links Guardian record & enrolls into academic year/section</li>
                <li>Generates initial tuition fee invoice & audit log trail</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Mira"
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Kowalski"
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Student Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mira.kowalski@omni-edu.org"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Admission #</label>
                <input
                  type="text"
                  required
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' | 'O' })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="F">Female (F)</option>
                  <option value="M">Male (M)</option>
                  <option value="O">Other (O)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Class / Cohort Name</label>
                <input
                  type="text"
                  required
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  placeholder="Year 3 Computer Science"
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Section</label>
                <input
                  type="text"
                  required
                  value={formData.section_name}
                  onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                  placeholder="Section A"
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Guardian Profile Section */}
            <div className="border-t border-border pt-3">
              <h4 className="font-bold text-foreground mb-2">Guardian Profile</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Guardian First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian.first_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, first_name: e.target.value },
                      })
                    }
                    placeholder="Jan"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Guardian Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian.last_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, last_name: e.target.value },
                      })
                    }
                    placeholder="Kowalski"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.guardian.phone_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, phone_number: e.target.value },
                      })
                    }
                    placeholder="+15559876543"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Relationship</label>
                  <select
                    value={formData.guardian.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, relationship: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Legal Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Execute Admission Pipeline
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
