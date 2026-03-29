import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/app-layout';
import { readAuth } from './auth/auth-store';
import { ContactsPage } from './pages/contacts-page';
import { DealDetailsPage } from './pages/deal-details-page';
import { DealsPage } from './pages/deals-page';
import { KanbanPage } from './pages/kanban-page';
import { LoginPage } from './pages/login-page';
import { ProjectsPage } from './pages/projects-page';
import { TasksPage } from './pages/tasks-page';

function Protected() {
  const auth = readAuth();
  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected />}>
        <Route index element={<Navigate to="/kanban" replace />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="deals/:id" element={<DealDetailsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="projects" element={<ProjectsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
