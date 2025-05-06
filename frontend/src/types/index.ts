/**
 * Common TypeScript interfaces for the application
 */

// User related types
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt?: Date
}

export interface UserProfile extends User {
  bio?: string
  location?: string
  website?: string
  joinedDate: Date
}

// Authentication types
export interface AuthProvider {
  id: string
  name: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Post related types
export type PostPrivacy = 'public' | 'private' | 'group'

export interface Post {
  post_id: string
  content: string
  media?: string
  author_id: string
  author_name: string
  author_avatar?: string
  created_at: Date
  updated_at?: Date
  group_id?: string
  visibility: PostPrivacy
  likes_count: number
  comments_count: number
  user_likes?: string[] // Array of user IDs who liked the post
}

export interface Comment {
  comment_id: string
  post_id: string
  content: string
  author_id: string
  author_name: string
  author_avatar?: string
  created_at: Date
}

// Friend related types
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'blocked'

export interface FriendRequest {
  id: string
  senderId: string
  senderName: string
  senderPhotoURL?: string
  receiverId: string
  receiverName: string
  receiverPhotoURL?: string
  status: FriendRequestStatus
  createdAt: Date
  updatedAt?: Date
}

export interface Friend {
  id: string
  userId: string
  displayName: string
  photoURL?: string
  email?: string
}

// Group related types
export interface Group {
  id: string
  name: string
  description: string
  imageUrl?: string
  createdAt: Date
  createdBy: string
  creatorName: string
  members: string[] // Array of user IDs
  admins: string[] // Array of user IDs (admins can manage the group)
}

export interface GroupMember {
  userId: string
  displayName: string
  photoURL?: string
  joinedAt: Date
  isAdmin: boolean
}

// API related types
export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form related types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  value: any
  required?: boolean
  options?: { value: string; label: string }[] // For select, checkbox, radio
  placeholder?: string
  error?: string
  validator?: (value: any) => string | null
}

export interface FormState {
  fields: Record<string, FormField>
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  title?: string
  autoClose?: boolean
  duration?: number
}
