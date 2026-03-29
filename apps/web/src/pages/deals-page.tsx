import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Deal } from '../types';

interface CreateDealPayload {
  title: string;
  amount?: string;
  stage?: string;
}

export function DealsPage() {
  const queryClient = useQueryClient();
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

  return (
    <section className="page">
      <h2>Deals</h2>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="Deal title"
          value={form.title}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, title: event.target.value }))
          }
          required
        />
        <input
          placeholder="Amount"
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
          <option value="NEW">NEW</option>
          <option value="QUALIFICATION">QUALIFICATION</option>
          <option value="PROPOSAL">PROPOSAL</option>
          <option value="NEGOTIATION">NEGOTIATION</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>
        <button type="submit" disabled={createMutation.isPending}>
          Add deal
        </button>
      </form>

      <div className="card">
        {dealsQuery.isLoading ? <p>Loading deals...</p> : null}
        {dealsQuery.isError ? <p className="error">Failed to load deals.</p> : null}
        <ul className="list">
          {dealsQuery.data?.map((deal) => (
            <li key={deal.id}>
              <strong>{deal.title}</strong>
              <span>{deal.stage}</span>
              <span>{deal.amount || '-'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
