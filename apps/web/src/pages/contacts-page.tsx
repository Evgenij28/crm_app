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
      <h2>Contacts</h2>
      <form className="card form inline" onSubmit={onSubmit}>
        <input
          placeholder="First name"
          value={form.firstName}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, firstName: event.target.value }))
          }
          required
        />
        <input
          placeholder="Last name"
          value={form.lastName}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, lastName: event.target.value }))
          }
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, email: event.target.value }))
          }
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, phone: event.target.value }))
          }
        />
        <button type="submit" disabled={createMutation.isPending}>
          Add contact
        </button>
      </form>

      <div className="card">
        {contactsQuery.isLoading ? <p>Loading contacts...</p> : null}
        {contactsQuery.isError ? <p className="error">Failed to load contacts.</p> : null}
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
