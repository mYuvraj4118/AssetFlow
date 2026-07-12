import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import ProtectedLayout from '../layouts/ProtectedLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages (Placeholders)
import Dashboard from '../pages/Dashboard';
import Organization from '../pages/Organization';
import Assets from '../pages/Assets/Assets';
import Allocation from '../pages/Allocation/Allocation';
import ResourceBooking from '../pages/ResourceBooking/ResourceBooking';
import Maintenance from '../pages/Maintenance/Maintenance';
import Audit from '../pages/Audit';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import Forbidden from '../pages/Error/Forbidden';
import ServerError from '../pages/Error/ServerError';
import NotFound from '../pages/NotFound/NotFound';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.ORGANIZATION} element={<Organization />} />
            <Route path={ROUTES.ASSETS} element={<Assets />} />
            <Route path={ROUTES.ALLOCATION} element={<Allocation />} />
            <Route path={ROUTES.BOOKING} element={<ResourceBooking />} />
            <Route path={ROUTES.MAINTENANCE} element={<Maintenance />} />
            <Route path={ROUTES.AUDIT} element={<Audit />} />
            <Route path={ROUTES.REPORTS} element={<Reports />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
        <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
