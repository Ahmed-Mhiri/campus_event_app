// src/components/templates/PageLayout/PageLayout.tsx

import { Outlet } from 'react-router-dom';
import { AppShell, Container } from '@mantine/core';
import { Navbar } from '@/components/organisms/Navbar/Navbar'; // adjust path if needed

export const PageLayout = () => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};