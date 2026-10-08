import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Assuming backend runs on 8000

const api = axios.create({
  baseURL: API_URL,
});

export interface Form {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  form_id: string;
  type: string;
  text: string;
  description?: string;
  is_required: boolean;
  order: number;
  options?: string;
}

export interface Answer {
  question_id: string;
  value: string;
}

export interface Response {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: Answer[];
}

export const getForms = async (): Promise<Form[]> => {
  const response = await api.get('/forms/');
  return response.data;
};

export const getForm = async (id: string): Promise<Form> => {
  const response = await api.get(`/forms/${id}`);
  return response.data;
};

export const createForm = async (title: string): Promise<Form> => {
  const response = await api.post('/forms/', { title, is_published: false });
  return response.data;
};

export const updateForm = async (id: string, data: { title?: string; is_published?: boolean }): Promise<Form> => {
  const form = await getForm(id);
  const response = await api.put(`/forms/${id}`, { ...form, ...data });
  return response.data;
};

export const deleteForm = async (id: string): Promise<void> => {
  await api.delete(`/forms/${id}`);
};

export const createQuestion = async (formId: string, question: Partial<Question>): Promise<Question> => {
  const response = await api.post(`/forms/${formId}/questions/`, question);
  return response.data;
};

export const updateQuestion = async (questionId: string, question: Partial<Question>): Promise<Question> => {
  const response = await api.put(`/questions/${questionId}`, question);
  return response.data;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

export const submitResponse = async (formId: string, answers: Answer[]): Promise<Response> => {
  const response = await api.post(`/forms/${formId}/responses/`, { answers });
  return response.data;
};

export const getResponses = async (formId: string): Promise<Response[]> => {
  const response = await api.get(`/forms/${formId}/responses/`);
  return response.data;
};

export const seedDB = async (): Promise<void> => {
  await api.post('/seed/');
};

export default api;
