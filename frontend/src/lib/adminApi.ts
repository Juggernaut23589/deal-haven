import apiClient from './api';

const get = <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
  apiClient.get(url, { params }).then((r) => r.data);

const patch = <T>(url: string, data?: unknown): Promise<T> =>
  apiClient.patch(url, data).then((r) => r.data);

export const adminApi = {
  getStats: () => get<{ data: { users: number; listings: number; orders: number; disputes: number; openDisputes: number } }>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) =>
    get<{ data: unknown[]; meta: { total: number; totalPages: number } }>('/admin/users', params as Record<string, unknown>),

  updateUserStatus: (id: string, status: string, reason?: string) =>
    patch(`/admin/users/${id}/status`, { status, reason }),

  getListings: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    get<{ data: unknown[]; meta: { total: number; totalPages: number } }>('/admin/listings', params as Record<string, unknown>),

  updateListingStatus: (id: string, status: string, reason?: string) =>
    patch(`/admin/listings/${id}/status`, { status, reason }),

  getDisputes: (params?: { page?: number; limit?: number; status?: string }) =>
    get<{ data: unknown[]; meta: { total: number; totalPages: number } }>('/admin/disputes', params as Record<string, unknown>),

  resolveDispute: (id: string, resolution: string, adminNotes: string) =>
    patch(`/admin/disputes/${id}/resolve`, { resolution, adminNotes }),

  getReports: (params?: { page?: number; limit?: number; status?: string }) =>
    get<{ data: unknown[]; meta: { total: number; totalPages: number } }>('/admin/reports', params as Record<string, unknown>),

  updateReportStatus: (id: string, status: string) =>
    patch(`/admin/reports/${id}/status`, { status }),

  getOrders: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    get<{ data: unknown[]; meta: { total: number; totalPages: number } }>('/admin/orders', params as Record<string, unknown>),

  getCategories: () =>
    get<{ data: unknown[] }>('/admin/categories'),

  updateCategory: (id: string, data: { isActive?: boolean; sortOrder?: number }) =>
    patch(`/admin/categories/${id}`, data),
};
