import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/layout/AdminLayout';
import DashboardHome from './pages/DashboardHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<div>Users Management (Coming Soon)</div>} />
            <Route path="roles" element={<div>Roles Management (Coming Soon)</div>} />
            <Route path="products" element={<div>Products Management (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
