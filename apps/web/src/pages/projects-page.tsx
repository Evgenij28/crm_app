import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Project } from '../types';

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      apiClient.post('/projects', payload),
    onSuccess: () => {
      setName('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; status: Project['status'] }) =>
      apiClient.patch(`/projects/${payload.id}`, { status: payload.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate({ name, description: description || undefined });
  };

  return (
    <section className="page">
      <h2>Проекты</h2>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="Название проекта"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          placeholder="Описание"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button type="submit" disabled={createMutation.isPending}>
          Создать проект
        </button>
      </form>

      <div className="card">
        {projectsQuery.isLoading ? <p>Загрузка проектов...</p> : null}
        {projectsQuery.isError ? <p className="error">Не удалось загрузить проекты.</p> : null}
        <ul className="list">
          {(projectsQuery.data ?? []).map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              <span>{project._count?.tasks ?? 0} задач</span>
              <select
                value={project.status}
                onChange={(event) =>
                  updateMutation.mutate({
                    id: project.id,
                    status: event.target.value as Project['status'],
                  })
                }
              >
                <option value="ACTIVE">Активный</option>
                <option value="ON_HOLD">На паузе</option>
                <option value="COMPLETED">Завершен</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
