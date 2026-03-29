export interface AuthUser {
  userId: string;
  organizationId: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Contact {
  id: string;
  organizationId?: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface DealPipeline {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface DealPipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string | null;
  deals?: Deal[];
}

export interface Deal {
  id: string;
  title: string;
  description?: string | null;
  amount?: string | null;
  stage: string;
  stageId?: string | null;
  pipelineId?: string | null;
  contact?: Contact | null;
  pipeline?: DealPipeline | null;
  pipelineStage?: DealPipelineStage | null;
}

export interface DealHistoryItem {
  id: string;
  type: 'NOTE' | 'STAGE_CHANGED' | 'AUTOMATION' | 'SYSTEM';
  message: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueAt?: string | null;
  projectId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  project?: Project | null;
  assignees?: Array<{
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface TaskKanbanColumn {
  status: Task['status'];
  tasks: Task[];
}

export interface TaskKanbanResponse {
  columns: TaskKanbanColumn[];
}
