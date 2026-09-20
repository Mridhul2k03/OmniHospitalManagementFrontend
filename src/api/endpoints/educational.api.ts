import { apiClient } from '@/api/client/axios'
import {
  Student,
  StudentAdmissionPayload,
  StaffMember,
  AcademicYear,
  AcademicTerm,
  AcademicDepartment,
  BulkAttendancePayload,
  Exam,
  ExamMark,
  EduInvoice,
  RecordPaymentPayload,
  PaymentReceipt,
  AnnouncementItem,
  AppNotificationItem,
  AuditLogItem,
} from '@/types'

export interface StudentFilterParams {
  search?: string
  status?: string
  gender?: string
  ordering?: string
  page?: number
  page_size?: number
}

export const educationalApi = {
  // --- 6.4 Students & Admissions ---
  getStudents: async (params?: StudentFilterParams): Promise<Student[]> => {
    const response = await apiClient.get<Student[]>('/students/', { params })
    return response.data
  },

  admitStudent: async (payload: StudentAdmissionPayload): Promise<{ success: boolean; message: string; data: Student }> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: Student }>('/students/admit/', payload)
    return response.data
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<Student>(`/students/${id}/`)
    return response.data
  },

  updateStudent: async (id: string, patch: Partial<Student>): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}/`, patch)
    return response.data
  },

  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}/`)
  },

  // --- 6.5 Staff & Faculty ---
  getStaff: async (params?: { search?: string; department?: string; employment_type?: string; status?: string }): Promise<StaffMember[]> => {
    const response = await apiClient.get<StaffMember[]>('/staff/', { params })
    return response.data
  },

  createStaff: async (payload: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await apiClient.post<StaffMember>('/staff/', payload)
    return response.data
  },

  // --- 6.6 Academic Structure ---
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const response = await apiClient.get<AcademicYear[]>('/academics/years/')
    return response.data
  },

  getAcademicTerms: async (): Promise<AcademicTerm[]> => {
    const response = await apiClient.get<AcademicTerm[]>('/academics/terms/')
    return response.data
  },

  getDepartments: async (): Promise<AcademicDepartment[]> => {
    const response = await apiClient.get<AcademicDepartment[]>('/academics/departments/')
    return response.data
  },

  getCourses: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/academics/courses/')
    return response.data
  },

  getSubjects: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/academics/subjects/')
    return response.data
  },

  getClasses: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/academics/classes/')
    return response.data
  },

  getSections: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/academics/sections/')
    return response.data
  },

  // --- 6.7 Attendance Tracking ---
  getAttendanceRecords: async (params?: { date?: string; section?: string; status?: string }): Promise<unknown[]> => {
    const response = await apiClient.get('/attendance/records/', { params })
    return response.data
  },

  bulkMarkAttendance: async (payload: BulkAttendancePayload): Promise<{ success: boolean; message: string; data: { count: number } }> => {
    const response = await apiClient.post('/attendance/records/bulk-mark/', payload)
    return response.data
  },

  getAttendanceCorrections: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/attendance/corrections/')
    return response.data
  },

  // --- 6.8 Examinations & Grading ---
  getExams: async (): Promise<Exam[]> => {
    const response = await apiClient.get<Exam[]>('/exams/exams/')
    return response.data
  },

  publishExam: async (examId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/exams/exams/${examId}/publish/`)
    return response.data
  },

  getExamMarks: async (params?: { exam?: string; student?: string }): Promise<ExamMark[]> => {
    const response = await apiClient.get<ExamMark[]>('/exams/marks/', { params })
    return response.data
  },

  updateExamMark: async (markId: string, marks_obtained: string): Promise<ExamMark> => {
    const response = await apiClient.patch<ExamMark>(`/exams/marks/${markId}/`, { marks_obtained })
    return response.data
  },

  // --- 6.9 Finance, Invoicing & Payments ---
  getInvoices: async (params?: { student?: string; status?: string }): Promise<EduInvoice[]> => {
    const response = await apiClient.get<EduInvoice[]>('/finance/invoices/', { params })
    return response.data
  },

  generateInvoice: async (payload: Record<string, unknown>): Promise<EduInvoice> => {
    const response = await apiClient.post<EduInvoice>('/finance/invoices/generate/', payload)
    return response.data
  },

  recordPayment: async (payload: RecordPaymentPayload): Promise<{ success: boolean; message: string; data: PaymentReceipt }> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: PaymentReceipt }>(
      '/finance/payments/record/',
      payload
    )
    return response.data
  },

  // --- 6.10 Communications & Bulletins ---
  getAnnouncements: async (): Promise<AnnouncementItem[]> => {
    const response = await apiClient.get<AnnouncementItem[]>('/communications/announcements/')
    return response.data
  },

  createAnnouncement: async (payload: { title: string; content: string; target_audience?: string; is_published?: boolean }): Promise<AnnouncementItem> => {
    const response = await apiClient.post<AnnouncementItem>('/communications/announcements/', payload)
    return response.data
  },

  getNotifications: async (): Promise<AppNotificationItem[]> => {
    const response = await apiClient.get<AppNotificationItem[]>('/communications/notifications/')
    return response.data
  },

  markNotificationRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/communications/notifications/${notificationId}/mark-read/`)
    return response.data
  },

  // --- 6.11 Audit Logging ---
  getAuditLogs: async (params?: { resource_type?: string; action?: string; page?: number }): Promise<AuditLogItem[]> => {
    const response = await apiClient.get<AuditLogItem[]>('/audit/', { params })
    return response.data
  },
}
