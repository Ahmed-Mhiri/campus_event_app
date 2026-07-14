import { Outlet } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import { useHeadroom, useMediaQuery } from '@mantine/hooks';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';
import { MobileBottomNav } from '../organisms/MobileBottomNav';

export const PageLayout = () => {
  const pinned = useHeadroom({ fixedAt: 120 });
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell header={{ height: { base: 56, md: 64 } }} padding={0}>
      <AppShell.Header
        className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/50 transition-transform duration-200"
        style={{ transform: pinned ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Box
          component="main"
          className="min-h-[calc(100vh-64px)]"
          pb={isMobile ? 80 : 0} // Only add bottom padding on mobile
        >
          <Outlet />
        </Box>
        <Footer />
        {isMobile && <MobileBottomNav />}
      </AppShell.Main>
    </AppShell>
  );
};