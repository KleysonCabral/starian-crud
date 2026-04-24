import http from '../../../core/http/axios.instance';
import type { ApiSuccess } from '../../../core/types/api-response.type';
import type {
  CreatePersonPayload,
  Person,
  UpdatePersonPayload,
} from '../types/person.types';

const BASE = '/persons';

async function getAll(): Promise<Person[]> {
  const { data } = await http.get<ApiSuccess<Person[]>>(BASE);
  return data.data;
}

async function getById(id: string): Promise<Person> {
  const { data } = await http.get<ApiSuccess<Person>>(`${BASE}/${id}`);
  return data.data;
}

async function create(payload: CreatePersonPayload): Promise<Person> {
  const { data } = await http.post<ApiSuccess<Person>>(BASE, payload);
  return data.data;
}

async function update(id: string, payload: UpdatePersonPayload): Promise<Person> {
  const { data } = await http.put<ApiSuccess<Person>>(`${BASE}/${id}`, payload);
  return data.data;
}

async function remove(id: string): Promise<void> {
  await http.delete(`${BASE}/${id}`);
}

export const personService = { getAll, getById, create, update, remove };
