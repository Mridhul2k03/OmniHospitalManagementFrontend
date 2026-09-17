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

  // Update housekeeping task status
  updateTaskStatus: async (
    taskId: string,
    status: HousekeepingTaskStatus,
    notes?: string
  ): Promise<HousekeepingTask> => {
    const response = await apiClient.patch<HousekeepingTask>(`/housekeeping/tasks/${taskId}/`, {
      status,
      notes,
    })
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

  // Register new found item
  createLostAndFoundItem: async (data: Partial<LostAndFoundItem>): Promise<LostAndFoundItem> => {
    const response = await apiClient.post<LostAndFoundItem>('/housekeeping/lost-found/', data)
    return response.data
  },
}
