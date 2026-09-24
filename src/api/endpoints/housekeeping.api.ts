import { apiClient } from '@/api/client/axios'
import { HousekeepingTask, HousekeepingTaskStatus, LostAndFoundItem } from '@/types'

export const housekeepingApi = {
  // Get active housekeeping tasks
  getTasks: async (status?: HousekeepingTaskStatus): Promise<HousekeepingTask[]> => {
    const response = await apiClient.get<HousekeepingTask[]>('/housekeeping/tasks/', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  // Specification method alias
  getTurnoverTasks: async (params?: Record<string, any>): Promise<HousekeepingTask[]> => {
    const response = await apiClient.get<HousekeepingTask[]>('/housekeeping/tasks/', { params })
    return response.data
  },

  // Create new housekeeping turnover task
  createTask: async (data: Partial<HousekeepingTask> & Record<string, any>): Promise<HousekeepingTask> => {
    const response = await apiClient.post<HousekeepingTask>('/housekeeping/tasks/', data)
    return response.data
  },

  // Update housekeeping task generic
  updateTask: async (taskId: string, data: Partial<HousekeepingTask> & Record<string, any>): Promise<HousekeepingTask> => {
    const response = await apiClient.patch<HousekeepingTask>(`/housekeeping/tasks/${taskId}/`, data)
    return response.data
  },

  // Update housekeeping task status
  updateTaskStatus: async (
    taskId: string,
    statusOrPayload: HousekeepingTaskStatus | { status: string; checklist?: any[]; notes?: string },
    notes?: string
  ): Promise<HousekeepingTask> => {
    const payload = typeof statusOrPayload === 'string'
      ? { status: statusOrPayload, notes }
      : statusOrPayload
    const response = await apiClient.patch<HousekeepingTask>(`/housekeeping/tasks/${taskId}/`, payload)
    return response.data
  },

  // Submit completed inspection checklist for a room turnover
  submitChecklist: async (
    taskId: string,
    checklistData: Record<string, boolean>
  ): Promise<HousekeepingTask> => {
    const response = await apiClient.post<HousekeepingTask>(
      `/housekeeping/tasks/${taskId}/checklist/`,
      { checklist: checklistData }
    )
    return response.data
  },

  // Get Lost and Found logs
  getLostAndFound: async (status?: 'stored' | 'claimed' | 'disposed'): Promise<LostAndFoundItem[]> => {
    const response = await apiClient.get<LostAndFoundItem[]>('/housekeeping/lost-found/', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  // Specification method alias
  getLostAndFoundItems: async (): Promise<LostAndFoundItem[]> => {
    const response = await apiClient.get<LostAndFoundItem[]>('/housekeeping/lost-found/')
    return response.data
  },

  // Register new found item
  createLostAndFoundItem: async (data: Partial<LostAndFoundItem>): Promise<LostAndFoundItem> => {
    const response = await apiClient.post<LostAndFoundItem>('/housekeeping/lost-found/', data)
    return response.data
  },

  // Bridges registering found items into custody vault
  registerFoundItem: async (payload: { itemDescription: string; category?: string; foundLocation: string; foundBy: string }): Promise<LostAndFoundItem> => {
    const response = await apiClient.post<LostAndFoundItem>('/housekeeping/lost-found/', payload)
    return response.data
  },

  // Bridges releasing custody item to verified owner
  claimFoundItem: async (id: string, payload: { claimantName: string; verifiedBy: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/housekeeping/lost-found/${id}/claim/`, payload)
    return response.data
  },
}
