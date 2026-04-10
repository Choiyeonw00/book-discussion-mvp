import apiClient from './client';
import type { BookSearchResult } from '../types';

export const booksApi = {
  search: async (query: string) => {
    const res = await apiClient.get<{ items: BookSearchResult[] }>('/books/search', { params: { q: query } });
    return { data: res.data.items || [] };
  },
};
