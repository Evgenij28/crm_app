import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Deal } from '../types';

interface CreateDealPayload {
  title: string;
  amount?: string;
  stage?: string;
}

const dealStageLabels: Record<string, string> = {
  NEW: 'Новая',
  QUALIFICATION: 'Квалификация',
  PROPOSAL: 'Предложение',
  NEGOTIATION: 'Переговоры',
  WON: 'Выиграна',
  LOST: 'Проиграна',
};

export function DealsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CreateDealPayload>({
    title: '',
    amount: '',
    stage: 'NEW',
  });

  const dealsQuery = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await apiClient.get<Deal[]>('/deals');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDealPayload) => apiClient.post('/deals', payload),
    onSuccess: () => {
      setForm({ title: '', amount: '', stage: 'NEW' });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate(form);
  };

  const filteredDeals = (dealsQuery.data ?? []).filter((deal) =>
    deal.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="page">
      <div className="page-header">
        <h2>Сделки</h2>
        <input
          placeholder="Поиск сделки"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="Название сделки"
          value={form.title}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, title: event.target.value }))
          }
          required
        />
        <input
          placeholder="Сумма"
          value={form.amount}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, amount: event.target.value }))
          }
        />
        <select
          value={form.stage}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, stage: event.target.value }))
          }
        >
          <option value="NEW">Новая</option>
          <option value="QUALIFICATION">Квалификация</option>
          <option value="PROPOSAL">Предложение</option>
          <option value="NEGOTIATION">Переговоры</option>
          <option value="WON">Выиграна</option>
          <option value="LOST">Проиграна</option>
        </select>
        <button type="submit" disabled={createMutation.isPending}>
          Добавить сделку
        </button>
      </form>

      <div className="card">
        {dealsQuery.isLoading ? <p>Загрузка сделок...</p> : null}
        {dealsQuery.isError ? <p className="error">Не удалось загрузить сделки.</p> : null}
        <ul className="list">
          {filteredDeals.map((deal) => (
            <li key={deal.id}>
              <strong>
                <Link to={`/deals/${deal.id}`}>{deal.title}</Link>
              </strong>
              <span>
                {deal.pipelineStage?.name ?? dealStageLabels[deal.stage] ?? deal.stage}
              </span>
              <span>{deal.amount || '-'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
