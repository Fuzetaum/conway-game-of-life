import axios from 'axios';
import { Board, CreateBoardRequest, UpdateBoardRequest, GenerationRequest } from '@customTypes/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

export const boardService = {
  create: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post<Board>('/api/board', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBoardRequest): Promise<Board> => {
    const response = await api.put<Board>(`/api/board/${id}`, data);
    return response.data;
  },

  getById: async (id: string): Promise<Board> => {
    const response = await api.get<Board>(`/api/board/${id}`);
    return response.data;
  },

  getNextState: async (id: string): Promise<Board> => {
    const response = await api.post<Board>(`/api/board/${id}/next`);
    return response.data;
  },

  getStateAfterGenerations: async (id: string, data: GenerationRequest): Promise<Board> => {
    const response = await api.post<Board>(`/api/board/${id}/advance`, data);
    return response.data;
  },

  getFinalState: async (id: string, data: GenerationRequest): Promise<Board> => {
    const response = await api.post<Board>(`/api/board/${id}/final`, data);
    return response.data;
  }
};