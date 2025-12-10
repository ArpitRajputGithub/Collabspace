import { create } from 'zustand'

interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  role: string
  memberCount: number
  createdAt: string
}

interface Project {
  id: string
  name: string
  description?: string
  color: string
  taskCount: number
  completedTasks: number
  createdAt: string
}

interface WorkspaceState {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  projects: Project[]
  isLoading: boolean
  
  // Actions
  setCurrentWorkspace: (workspace: Workspace) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  setLoading: (loading: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  projects: [],
  isLoading: false,

  setCurrentWorkspace: (workspace) =>
    set({ currentWorkspace: workspace }),

  setWorkspaces: (workspaces) =>
    set({ workspaces }),

  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),

  updateWorkspace: (id, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === id ? { ...ws, ...updates } : ws
      ),
      currentWorkspace:
        state.currentWorkspace?.id === id
          ? { ...state.currentWorkspace, ...updates }
          : state.currentWorkspace,
    })),

  setProjects: (projects) =>
    set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),
}))
