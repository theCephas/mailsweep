// User types
export interface User {
  id: string;
  email: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface GoogleOAuthResponse {
  user: UserResponse;
  token: string;
}

// Email types
export interface EmailItem {
  id: string;
  threadId: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  date: string;
  internalDate: string;
}

export interface SearchParams {
  sender: string;
  from: string; // ISO date string
  to: string;   // ISO date string
}

export interface SearchEmailsRequest {
  sender: string;
  from: string;
  to: string;
}

export interface SearchEmailsResponse {
  emails: EmailItem[];
  total: number;
}

export interface EmailPreviewResponse {
  id: string;
  subject: string;
  snippet: string;
  body: string;
  sender: string;
  date: string;
}

// Action types
export interface BulkActionRequest {
  ids: string[];
}

export interface BulkActionResponse {
  success: boolean;
  count: number;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  count: number;
  message: string;
}

export interface TrashResponse {
  success: boolean;
  count: number;
  message: string;
}

// Error types
export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: ErrorResponse;
  success: boolean;
}
