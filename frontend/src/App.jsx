import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Real components
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminQueues from './pages/AdminQueues';
import AdminUsers from './pages/AdminUsers';
import AdminHierarchy from './pages/AdminHierarchy';
import StaffDashboard from './pages/StaffDashboard';
import JoinQueue from './pages/JoinQueue';
import AdminLayout from './layouts/AdminLayout';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="card text-center max-w-md">
      <h1 className="text-4xl font-black text-slate-900 mb-4">403</h1>
      <h2 className="text-xl font-bold mb-4">Unauthorized Access</h2>
      <p className="text-slate-500 mb-8">You do not have permission to access this page.</p>
      <button onClick={() => window.location.href='/login'} className="btn btn-primary w-full justify-center">
        Go to Login
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: '600'
            }
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* User selection flow (Protected to ensure token generation works) */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']} />}>
            <Route path="/join" element={<JoinQueue />} />
          </Route>

          {/* Admin Routes with Layout */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/queues" element={<AdminLayout><AdminQueues /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/hierarchy" element={<AdminLayout><AdminHierarchy /></AdminLayout>} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route path="/staff" element={<StaffDashboard />} />
          </Route>

          {/* Default Redirection: Go to /join which will trigger login if needed */}
          <Route path="/" element={<Navigate to="/join" replace />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
