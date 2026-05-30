import api from '../lib/api';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  content: NotificationResponse[];
  totalElements: number;
  totalPages: number;
}

export const getNotifications = (): Promise<PaginatedNotifications> =>
  api.get<PaginatedNotifications>('/api/v1/notifications').then(r => r.data);

export const markAsRead = (notificationId: string): Promise<void> =>
  api.patch(`/api/v1/notifications/${notificationId}/read`).then(() => undefined);

export const markAllAsRead = (): Promise<void> =>
  api.patch('/api/v1/notifications/read-all').then(() => undefined);
