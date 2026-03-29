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
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface Deal {
  id: string;
  title: string;
  description?: string | null;
  amount?: string | null;
  stage: string;
  contact?: Contact | null;
}
