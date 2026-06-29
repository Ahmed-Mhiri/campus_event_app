// src/components/templates/AdminLayout/AdminLayout.tsx

import { Outlet } from 'react-router-dom';
import { AppShell, Container, NavLink } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <AppShell
      navbar={{
        width: 260,
        breakpoint: 'sm',
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        {/* Optional admin header */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', height: '100%' }}>
          <h3>Admin Panel</h3>
        </div>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
          active={location.pathname === ROUTES.ADMIN_DASHBOARD}
        />
        <NavLink
          label="Events"
          onClick={() => navigate(ROUTES.ADMIN_EVENTS)}
          active={location.pathname === ROUTES.ADMIN_EVENTS}
        />
        <NavLink
          label="Users"
          onClick={() => navigate(ROUTES.ADMIN_USERS)}
          active={location.pathname === ROUTES.ADMIN_USERS}
        />
        <NavLink
          label="Categories"
          onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
          active={location.pathname === ROUTES.ADMIN_CATEGORIES}
        />
        <NavLink
          label="Reports"
          onClick={() => navigate(ROUTES.ADMIN_REPORTS)}
          active={location.pathname === ROUTES.ADMIN_REPORTS}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};