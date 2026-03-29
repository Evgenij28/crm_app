import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Deal, DealHistoryItem } from '../types';

export function DealDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const dealQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['deal', id],
    queryFn: async () => {
      const response = await apiClient.get<Deal & { tasks?: { id: string; title: string }[] }>(
        `/deals/${id}`,
      );
      return response.data;
    },
  });

  const timelineQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['deal-timeline', id],
    queryFn: async () => {
      const response = await apiClient.get<DealHistoryItem[]>(`/deals/${id}/timeline`);
      return response.data;
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (message: string) =>
      apiClient.post(`/deals/${id}/timeline/note`, { message }),
    onSuccess: () => {
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['deal-timeline', id] });
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!note.trim()) {
      return;
    }
    addNoteMutation.mutate(note.trim());
  };

  return (
    <section className="page">
      <h2>Карточка сделки</h2>
      {dealQuery.isLoading ? <p>Загрузка сделки...</p> : null}
      {dealQuery.isError ? <p className="error">Не удалось загрузить карточку сделки.</p> : null}

      {dealQuery.data ? (
        <div className="deal-grid">
          <div className="card">
            <h3>{dealQuery.data.title}</h3>
            <p>{dealQuery.data.description || 'Описание не заполнено'}</p>
            <p>
              Этап: {dealQuery.data.pipelineStage?.name || dealQuery.data.stage} | Сумма:{' '}
              {dealQuery.data.amount || '—'}
            </p>
            <p>
              Контакт:{' '}
              {dealQuery.data.contact
                ? `${dealQuery.data.contact.firstName} ${dealQuery.data.contact.lastName}`
                : '—'}
            </p>
          </div>

          <div className="card">
            <h3>Связанные задачи</h3>
            <ul className="list">
              {(dealQuery.data.tasks ?? []).map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong>
                </li>
              ))}
              {(dealQuery.data.tasks ?? []).length === 0 ? <li>Задач пока нет</li> : null}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3>Таймлайн</h3>
        <form className="form" onSubmit={onSubmit}>
          <input
            placeholder="Комментарий к сделке"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button type="submit" disabled={addNoteMutation.isPending}>
            Добавить комментарий
          </button>
        </form>

        {timelineQuery.isLoading ? <p>Загрузка истории...</p> : null}
        <ul className="list">
          {(timelineQuery.data ?? []).map((item) => (
            <li key={item.id}>
              <strong>{item.message}</strong>
              <span>{new Date(item.createdAt).toLocaleString('ru-RU')}</span>
              <span>
                {item.user
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : 'Система'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
