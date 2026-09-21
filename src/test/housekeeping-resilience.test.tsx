import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { HousekeepingHub } from '@/features/housekeeping/HousekeepingHub'
import { ToastProvider } from '@/components/ui/toast'
import { housekeepingApi } from '@/api/endpoints/housekeeping.api'

describe('Housekeeping Hub Resilience & Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders safely when backend tasks omit checklist property', async () => {
    // Simulate backend returning tasks without checklist (as was causing the TypeError)
    vi.spyOn(housekeepingApi, 'getTasks').mockResolvedValue([
      {
        id: 'hk-legacy-1',
        roomNumber: '103',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Maria Santos',
      } as any,
      {
        id: 'hk-legacy-2',
        roomNumber: '104',
        status: 'pending',
        priority: 'medium',
      } as any,
    ])

    vi.spyOn(housekeepingApi, 'getLostAndFound').mockResolvedValue([])

    render(
      <ToastProvider>
        <HousekeepingHub />
      </ToastProvider>
    )

    // Verify header renders
    expect(screen.getByText(/Housekeeping & Inspections/i)).toBeInTheDocument()

    // Wait for rooms to appear
    await waitFor(() => {
      expect(screen.getByText(/Room 103/i)).toBeInTheDocument()
      expect(screen.getByText(/Room 104/i)).toBeInTheDocument()
    })

    // Verify Maria Santos is displayed safely
    expect(screen.getByText(/Maria Santos/i)).toBeInTheDocument()
  })

  it('opens checklist inspection modal safely without crashing', async () => {
    vi.spyOn(housekeepingApi, 'getTasks').mockResolvedValue([
      {
        id: 'hk-1',
        roomNumber: '201',
        status: 'cleaning_started',
        priority: 'high',
        assignedAttendantName: 'Carlos Ruiz',
        checklist: [
          { id: 'c1', task: 'Replace bed linen with 400TC sheets', completed: false },
          { id: 'c2', task: 'Sanitize marble surfaces', completed: true },
        ],
      } as any,
    ])

    vi.spyOn(housekeepingApi, 'getLostAndFound').mockResolvedValue([])

    render(
      <ToastProvider>
        <HousekeepingHub />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Room 201/i)).toBeInTheDocument()
    })

    // Click Checklist button
    const checklistBtn = screen.getByRole('button', { name: /Checklist/i })
    fireEvent.click(checklistBtn)

    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText(/Hygiene & Inspection Checklist - Room 201/i)).toBeInTheDocument()
      expect(screen.getByText(/Replace bed linen with 400TC sheets/i)).toBeInTheDocument()
    })
  })

  it('renders empty states gracefully when no tasks are returned', async () => {
    vi.spyOn(housekeepingApi, 'getTasks').mockResolvedValue([])
    vi.spyOn(housekeepingApi, 'getLostAndFound').mockResolvedValue([])

    render(
      <ToastProvider>
        <HousekeepingHub />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No active housekeeping turnover tasks at this time/i)).toBeInTheDocument()
    })
  })
})
