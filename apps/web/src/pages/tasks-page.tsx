import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Task, TaskKanbanResponse } from '../types';

interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  projectId?: string;
  dealId?: string;
  contactId?: string;
}

const taskStatusLabels: Record<Task['status'], string> = {
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  REVIEW: 'Проверка',
  DONE: 'Готово',
};

export function TasksPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    dealId: '',
    contactId: '',
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [mineOnly, setMineOnly] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await apiClient.get('/projects')).data as { id: string; name: string }[],
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', statusFilter, mineOnly],
    queryFn: async () =>
      (
        await apiClient.get<Task[]>('/tasks', {
          params: { status: statusFilter || undefined, mine: mineOnly || undefined },
        })
      ).data,
  });

  const kanbanQuery = useQuery({
    queryKey: ['tasks-kanban'],
    queryFn: async () => (await apiClient.get<TaskKanbanResponse>('/tasks/kanban')).data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => apiClient.post('/tasks', payload),
    onSuccess: () => {
      setForm({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: '',
        dealId: '',
        contactId: '',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-kanban'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: Task['status'] }) =>
      apiClient.patch(`/tasks/${payload.id}`, { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-kanban'] });
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      projectId: form.projectId || undefined,
      dealId: form.dealId || undefined,
      contactId: form.contactId || undefined,
    });
  };

  return (
    <section className="page">
      <h2>Задачи</h2>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="Название задачи"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <input
          placeholder="Описание"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />
        <select
          value={form.priority}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              priority: event.target.value as Task['priority'],
            }))
          }
        >
          <option value="LOW">Низкий приоритет</option>
          <option value="MEDIUM">Средний приоритет</option>
          <option value="HIGH">Высокий приоритет</option>
        </select>
        <select
          value={form.projectId}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, projectId: event.target.value }))
          }
        >
          <option value="">Без проекта</option>
          {(projectsQuery.data ?? []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          placeholder="ID сделки (опционально)"
          value={form.dealId}
          onChange={(event) => setForm((prev) => ({ ...prev, dealId: event.target.value }))}
        />
        <button type="submit" disabled={createMutation.isPending}>
          Создать задачу
        </button>
      </form>

      <div className="card form inline">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Все статусы</option>
          <option value="TODO">К выполнению</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="REVIEW">Проверка</option>
          <option value="DONE">Готово</option>
        </select>
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(event) => setMineOnly(event.target.checked)}
          />
          Только мои
        </label>
      </div>

      <div className="card">
        <h3>Список</h3>
        <ul className="list">
          {(tasksQuery.data ?? []).map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              <span>{taskStatusLabels[task.status]}</span>
              <span>{task.project?.name || '—'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Канбан</h3>
        <div className="kanban-board compact">
          {(kanbanQuery.data?.columns ?? []).map((column) => (
            <div key={column.status} className="kanban-column">
              <div className="kanban-column-header">
                <strong>{taskStatusLabels[column.status]}</strong>
                <span>{column.tasks.length}</span>
              </div>
              <div className="kanban-column-body">
                {column.tasks.map((task) => (
                  <article key={task.id} className="kanban-card">
                    <strong>{task.title}</strong>
                    <p>{task.project?.name || 'Без проекта'}</p>
                    <select
                      value={task.status}
                      onChange={(event) =>
                        updateStatusMutation.mutate({
                          id: task.id,
                          status: event.target.value as Task['status'],
                        })
                      }
                    >
                      <option value="TODO">К выполнению</option>
                      <option value="IN_PROGRESS">В работе</option>
                      <option value="REVIEW">Проверка</option>
                      <option value="DONE">Готово</option>
                    </select>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
