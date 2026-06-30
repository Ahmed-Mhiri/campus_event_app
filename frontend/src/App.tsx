import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute, AdminRoute } from '@/components/templates/ProtectedRoute';
import { AuthInitializer } from '@/components/templates/AuthInitializer';

// Layouts
import { PageLayout } from '@/components/templates/PageLayout';
import { AdminLayout } from '@/components/templates/AdminLayout';
import { AuthLayout } from '@/components/templates/AuthLayout';

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
import { AdminReportsPage } from '@/pages/Admin/AdminReportsPage';

// Public Profile
import { PublicProfilePage } from '@/pages/Profile/PublicProfilePage';

// Error Pages
import { NotFoundPage } from '@/pages/Error/NotFoundPage';
import { ErrorPage } from '@/pages/Error/ErrorPage';

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
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
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
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
          <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Error routes */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;