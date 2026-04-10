import apiClient from './client';
import type { CreateMemoRequest, Memo } from '../types';

export const memosApi = {
  listByGroup: async (groupId: string) => {
    const res = await apiClient.get<any[]>(`/groups/${groupId}/memos`);
    const all = res.data || [];
    const myMemos = all.filter((m: any) => m.isOwn).map((m: any) => ({
      ...m,
      authorNickname: m.user?.nickname || '',
    }));
    const publicMemos = all.filter((m: any) => !m.isOwn).map((m: any) => ({
      ...m,
      authorNickname: m.user?.nickname || '',
      isContentHidden: !m.canView,
      content: m.content || '',
    }));
    return { data: { myMemos, publicMemos } };
  },

  create: (groupId: string, data: CreateMemoRequest) =>
    apiClient.post<Memo>(`/groups/${groupId}/memos`, data),

  update: (id: string, data: Partial<CreateMemoRequest>) =>
    apiClient.put<Memo>(`/memos/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/memos/${id}`),

  updateVisibility: (id: string, isPublic: boolean) =>
    apiClient.patch<Memo>(`/memos/${id}/visibility`, { isPublic }),
};
