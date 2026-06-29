// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute, AdminRoute } from '@/components/templates/ProtectedRoute';
import { AuthInitializer } from '@/components/templates/AuthInitializer';

// Layouts
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';
import { AdminLayout } from '@/components/templates/AdminLayout/AdminLayout';
import { AuthLayout } from '@/components/templates/AuthLayout/AuthLayout';

// Public Pages
import { HomePage } from '@/pages/Home/HomePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/Auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/Auth/ResetPasswordPage';

// Protected Pages
import { EventsPage } from '@/pages/Events/EventsPage';
import { EventDetailPage } from '@/pages/Events/EventDetailPage';
import { CreateEventPage } from '@/pages/Events/CreateEventPage';
import { EditEventPage } from '@/pages/Events/EditEventPage';
import { MyEventsPage } from '@/pages/Events/MyEventsPage';
import { MyProfilePage } from '@/pages/Profile/MyProfilePage';
import { EditProfilePage } from '@/pages/Profile/EditProfilePage';
import { ChangePasswordPage } from '@/pages/Profile/ChangePasswordPage';
import { PreferencesPage } from '@/pages/Profile/PreferencesPage';
import { TrustStatusPage } from '@/pages/Profile/TrustStatusPage';
import { MyRegistrationsPage } from '@/pages/Registrations/MyRegistrationsPage';
import { HostCheckInPage } from '@/pages/CheckIn/HostCheckInPage';
import { AttendeeCheckInPage } from '@/pages/CheckIn/AttendeeCheckInPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/Admin/AdminDashboardPage';
import { AdminEventsPage } from '@/pages/Admin/AdminEventsPage';
import { AdminUsersPage } from '@/pages/Admin/AdminUsersPage';
import { AdminCategoriesPage } from '@/pages/Admin/AdminCategoriesPage';

// Error Pages
import { NotFoundPage } from '@/pages/Error/NotFoundPage';
import { ErrorPage } from '@/pages/Error/ErrorPage';

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          {/* Auth (no main layout) */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>

          {/* Public routes */}
          <Route element={<PageLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.EVENTS} element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PageLayout />}>
              <Route path={ROUTES.CREATE_EVENT} element={<CreateEventPage />} />
              <Route path="/events/edit/:id" element={<EditEventPage />} />
              <Route path={ROUTES.MY_EVENTS} element={<MyEventsPage />} />
              <Route path={ROUTES.PROFILE} element={<MyProfilePage />} />
              <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
              <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
              <Route path={ROUTES.PREFERENCES} element={<PreferencesPage />} />
              <Route path={ROUTES.TRUST_STATUS} element={<TrustStatusPage />} />
              <Route path={ROUTES.MY_REGISTRATIONS} element={<MyRegistrationsPage />} />
              <Route path="/check-in/host/:eventId" element={<HostCheckInPage />} />
              <Route path="/check-in/attendee/:eventId" element={<AttendeeCheckInPage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_EVENTS} element={<AdminEventsPage />} />
              <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
              <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          {/* Error routes */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;