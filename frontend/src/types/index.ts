
export type UserRole =
  | 'STUDENT'
  | 'STUDENT_MODERATOR'
  | 'ACADEMIC_REPRESENTATIVE'
  | 'PLATFORM_ADMIN';

export type AccountStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  | 'DISABLED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber?: string;
  department?: string;
  faculty?: string;
  level?: number;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Lecture {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturer?: string;
  department?: string;
  level?: number;
  venue: Venue;
  startTime: string;
  endTime: string;
  date: string;
  status: LectureStatus;
}

export interface Venue {
  id: string;
  name: string;
  building?: string;
  capacity?: number;
}

export type LectureStatus =
  | 'SCHEDULED'
  | 'UPDATED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface LectureChangeReport {
  id: string;
  lectureId: string;
  reportedBy: string;
  changeType: ChangeType;
  description: string;
  proposedVenue?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  evidenceUrls: string[];
  status: ReportStatus;
  createdAt: string;
}

export type ChangeType =
  | 'VENUE_CHANGE'
  | 'TIME_CHANGE'
  | 'CANCELLATION'
  | 'LECTURE_ADDITION'
  | 'OTHER';

export type ReportStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'LECTURE_UPDATE' | 'ANNOUNCEMENT' | 'REPORT_UPDATE' | 'SYSTEM';
}
