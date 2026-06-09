import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/ui/layout';
import { BoardPage } from '@/pages/board';
import { ClientsPage } from '@/pages/clients';
import { ServicesPage } from '@/pages/services';
import { EmployeesPage } from '@/pages/employees';

export const AppRouter: React.FC = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/board" replace />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
    </Route>
  </Routes>
);
