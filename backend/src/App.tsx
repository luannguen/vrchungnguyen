import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import UserPage from './pages/UserPage';
import UsersPage from './pages/admin/UsersPage';
import AdminLayout from './components/admin/layout/AdminLayout';
import RolesPage from './pages/admin/RolesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProductsPage from './pages/admin/ProductsPage';
import EventsPage from './pages/admin/EventsPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import MenuManager from './pages/admin/MenuManager';
import CategoriesPage from './pages/admin/CategoriesPage';
import NewsPage from './pages/admin/NewsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user" element={<UserPage />} />

        {/* Admin Routes - Strict 'admin' role required */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
