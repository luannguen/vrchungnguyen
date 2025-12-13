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
import ContactsPage from './pages/admin/ContactsPage';
import MediaLibrary from './pages/admin/MediaLibrary';
import BannersPage from './pages/admin/BannersPage';
import PagesPage from './pages/admin/PagesPage';
import ServicesPage from './pages/admin/ServicesPage';
import ResourcesPage from './pages/admin/ResourcesPage'; // Added
import AchievementsPage from './pages/admin/AchievementsPage';
import FAQsPage from './pages/admin/FAQsPage';
import TeamPage from './pages/admin/TeamPage';
import ForgotPasswordPage from './components/admin/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/admin/pages/auth/ResetPasswordPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/user" element={<UserPage />} />

        {/* Admin Routes - Requires 'dashboard.view' permission */}
        <Route element={<ProtectedRoute requiredPermission="dashboard.view" />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            {/* Content Routes - Requires ANY content permission */}
            {/* Note: In Sidebar, we group these under 'content_management' which requires ANY of these */}
            <Route element={<ProtectedRoute oneOfPermissions={['content.view', 'content.create', 'content.edit', 'content.delete']} />}>
              <Route path="products" element={<ProductsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="faqs" element={<FAQsPage />} />
              <Route path="team" element={<TeamPage />} />
            </Route>

            {/* System Settings - Granular Permissions */}
            <Route path="users" element={<ProtectedRoute requiredPermission="users.view"><UsersPage /></ProtectedRoute>} />
            <Route path="roles" element={<ProtectedRoute requiredPermission="roles.manage"><RolesPage /></ProtectedRoute>} />
            <Route path="menu" element={<ProtectedRoute requiredPermission="settings.manage"><MenuManager /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requiredPermission="settings.view"><SettingsPage /></ProtectedRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
