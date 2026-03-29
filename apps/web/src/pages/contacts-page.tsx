import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { FormEvent } from 'react';
import type { Contact } from '../types';

interface CreateContactPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export function ContactsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateContactPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await apiClient.get<Contact[]>('/contacts');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateContactPayload) => apiClient.post('/contacts', payload),
    onSuccess: () => {
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <section className="page">
      <h2>Контакты</h2>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="Имя"
          value={form.firstName}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, firstName: event.target.value }))
          }
          required
        />
        <input
          placeholder="Фамилия"
          value={form.lastName}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, lastName: event.target.value }))
          }
          required
        />
        <input
          placeholder="Эл. почта"
          value={form.email}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, email: event.target.value }))
          }
        />
        <input
          placeholder="Телефон"
          value={form.phone}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, phone: event.target.value }))
          }
        />
        <button type="submit" disabled={createMutation.isPending}>
          Добавить контакт
        </button>
      </form>

      <div className="card">
        {contactsQuery.isLoading ? <p>Загрузка контактов...</p> : null}
        {contactsQuery.isError ? (
          <p className="error">Не удалось загрузить контакты.</p>
        ) : null}
        <ul className="list">
          {contactsQuery.data?.map((contact) => (
            <li key={contact.id}>
              <strong>
                {contact.firstName} {contact.lastName}
              </strong>
              <span>{contact.email || '-'}</span>
              <span>{contact.phone || '-'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
