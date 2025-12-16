interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  settings?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
  memberCount?: number
  projectCount?: number
  taskProgress?: number
  avatarUrl?: string
  members: WorkspaceMember[]
  role?: string
  joinedAt?: string
}

interface WorkspaceMember {
  id: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  joinedAt?: string
}

interface WorkspaceDetailResponse {
  data: Workspace
  userRole: 'owner' | 'admin' | 'member' | 'guest'
}

interface Activity {
  id: string
  type: 'task' | 'project' | 'member' | 'comment'
  action: string
  target: string
  targetType: string
  targetId: string
  timestamp: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  workspaceName?: string
  metadata?: Record<string, unknown>
}

interface DashboardStats {
  activeTodayCount: number
  weeklyActionsCount: number
  totalAssignedTasks: number
  completedTasks: number
  completionRate: number
}

interface Message {
  _id: string
  projectId: string
  userId: string
  userInfo: {
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
  }
  content: string
  messageType: 'text' | 'system' | 'file'
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api'
    console.log('API Base URL:', this.baseUrl)
  }

  setToken(token: string) {
    this.token = token
    console.log('API client token set:', token ? 'Token available' : 'No token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    console.log('🔥 API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenPreview: this.token?.slice(0, 10) + '...'
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Use JWT token for authentication
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    } else {
      console.warn('⚠️ Making API request WITHOUT token:', endpoint)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData = await response.json() as { message?: string; error?: string; code?: string }
          // Backend can return either 'message' or 'error' field
          errorMessage = errorData.message || errorData.error || errorMessage
          console.error('❌ API Error Response:', { message: errorMessage, code: errorData.code })
        } catch {
          // If response is not JSON, use status text
        }

        console.error('❌ API Error:', errorMessage)

        if (response.status === 401) {
          throw new Error('Unauthenticated - Please log in again')
        } else if (response.status === 403) {
          throw new Error('Forbidden - You do not have permission to access this resource')
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ API Success:', endpoint, data.success)
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    // Store the JWT token
    this.token = response.data.token
    console.log('✅ Backend login successful')
    return response.data
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile')
    return response.data
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.request<Workspace[]>('/workspaces')
    return response.data
  }

  async createWorkspace(data: {
    name: string
    description?: string
    slug: string
  }): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${workspaceId}`)
    return response.data
  }

  async updateWorkspace(workspaceId: string, data: { name?: string; description?: string }): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async getWorkspaceBySlug(slug: string, workspaceId?: string): Promise<WorkspaceDetailResponse> {
    // If workspaceId is provided, use it directly
    // Otherwise, find workspace ID by slug from user's workspaces
    let id = workspaceId

    if (!id) {
      // Check if we have a token before trying to fetch workspaces
      if (!this.token) {
        throw new Error('Authentication required. Please wait for authentication to complete.')
      }

      const workspaces = await this.getWorkspaces()
      const workspace = workspaces.find(ws => ws.slug === slug)
      if (!workspace) {
        throw new Error('Workspace not found')
      }
      id = workspace.id
    }

    // The backend returns { success: true, data: Workspace, userRole: string }
    // We need to fetch the raw response to get userRole
    const url = `${this.baseUrl}/workspaces/${id}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    } else {
      throw new Error('Authentication required')
    }

    const response = await fetch(url, { headers })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthenticated - Please log in again')
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const rawResponse = await response.json()
    // rawResponse is { success: true, data: Workspace, userRole: string }
    return {
      data: rawResponse.data,
      userRole: rawResponse.userRole || 'member'
    } as WorkspaceDetailResponse
  }

  // Member management methods
  async inviteMember(workspaceId: string, data: { email: string; role?: 'admin' | 'member' | 'guest' }): Promise<WorkspaceMember> {
    const response = await this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: 'admin' | 'member' | 'guest'): Promise<void> {
    await this.request(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await this.request(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    })
  }

  // Project methods
  async getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
    const response = await this.request<{ projects: Project[] }>(`/projects/workspace/${workspaceId}`)
    // Backend returns { success: true, data: { projects: [...] } }
    const data = response.data as { projects: Project[] }
    return data.projects
  }

  async createProject(workspaceId: string, data: {
    name: string
    description?: string
    color?: string
    startDate?: string
    endDate?: string
  }): Promise<Project> {
    if (!workspaceId || workspaceId.trim() === '') {
      throw new Error('Workspace ID is required to create a project')
    }

    const response = await this.request<{ project: Project; message?: string }>(`/projects/workspace/${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // Backend returns { message: "...", project: {...} }
    // The request method returns the JSON directly, so response is already the object
    return (response as any).project
  }

  async getProject(projectId: string): Promise<ProjectDetailResponse> {
    const response = await this.request<{
      project: Project
      statistics: {
        totalTasks: number
        completedTasks: number
        overdueTasks: number
        assignedTasks: number
        avgCompletionHours: string
      }
      taskStatuses: TaskStatus[]
    }>(`/projects/${projectId}`)
    const data = response.data as ProjectDetailResponse
    return data
  }

  async getProjectBoard(projectId: string): Promise<ProjectBoardResponse> {
    const response = await this.request<ProjectBoardResponse>(`/projects/${projectId}/board`)
    return response.data
  }

  async updateProject(projectId: string, data: {
    name?: string
    description?: string
    color?: string
    status?: string
  }): Promise<Project> {
    const response = await this.request<{ project: Project }>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    const responseData = response.data as { project: Project }
    return responseData.project
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // Task methods
  async createTask(projectId: string, data: {
    title: string
    description?: string
    statusId?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assigneeId?: string
    labels?: string[]
    dueDate?: string
    estimatedHours?: number
  }): Promise<{ task: Task }> {
    const response = await this.request<{ task: Task }>(`/tasks/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data as { task: Task }
  }

  async getTask(taskId: string): Promise<{
    task: Task; comments: Array<{
      id: string
      content: string
      userId: string
      createdAt: string
    }>
  }> {
    const response = await this.request<{
      task: Task; comments: Array<{
        id: string
        content: string
        userId: string
        createdAt: string
      }>
    }>(`/tasks/${taskId}`)
    return response.data
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const response = await this.request<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response.data as { task: Task }
  }

  async moveTask(taskId: string, data: { statusId: string; position: number }): Promise<{ task: Task }> {
    const response = await this.request<{ task: Task }>(`/tasks/${taskId}/move`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data as { task: Task }
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  // Activity methods
  async getRecentActivity(limit: number = 20): Promise<Activity[]> {
    const response = await this.request<Activity[]>(`/activity/recent?limit=${limit}`)
    return response.data
  }

  async getWorkspaceActivity(workspaceId: string, limit: number = 50): Promise<Activity[]> {
    const response = await this.request<Activity[]>(`/activity/workspace/${workspaceId}?limit=${limit}`)
    return response.data
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request<DashboardStats>('/dashboard/stats')
    return response.data
  }

  // Message methods
  async getProjectMessages(projectId: string, options?: { limit?: number; before?: string }): Promise<Message[]> {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.before) params.append('before', options.before)

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await this.request<Message[]>(`/projects/${projectId}/messages${queryString}`)
    return response.data
  }
}

export const apiClient = new ApiClient()

// Additional types
interface Project {
  id: string
  name: string
  description?: string
  color?: string
  status?: string
  startDate?: string
  endDate?: string
  createdBy?: string
  taskCount?: number
  completedTasks?: number
  createdAt: string
  updatedAt?: string
}

interface TaskStatus {
  id: string
  name: string
  slug: string
  color: string
  position: number
  isDefault?: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  labels: string[]
  statusId: string
  position: number
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  commentCount?: number
  createdAt: string
  updatedAt?: string
}

interface ProjectDetailResponse {
  project: Project
  statistics: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    assignedTasks: number
    avgCompletionHours: string
  }
  taskStatuses: TaskStatus[]
}

interface ProjectBoardResponse {
  project: { id: string; name: string; color?: string }
  board: Array<{
    id: string
    name: string
    slug: string
    color: string
    position: number
    tasks: Task[]
  }>
}

export type {
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceDetailResponse,
  Project,
  Task,
  TaskStatus,
  ProjectDetailResponse,
  ProjectBoardResponse,
  Activity,
  DashboardStats,
  Message
}
