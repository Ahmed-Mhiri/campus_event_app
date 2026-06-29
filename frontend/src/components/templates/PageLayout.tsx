import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, Container, Box } from '@mantine/core';
import { useHeadroom } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';
import { MobileBottomNav } from '../organisms/MobileBottomNav';

export const PageLayout = () => {
  const pinned = useHeadroom({ fixedAt: 120 });
  const location = useLocation();

  return (
    <AppShell header={{ height: { base: 56, md: 64 } }} padding={0}>
      <AppShell.Header
        style={{
          transform: pinned ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 200ms ease',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid var(--app-border)',
        }}
      >
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <Box
          component="main"
          style={{ minHeight: 'calc(100vh - 200px)', paddingBottom: 80 }}
        >
          <Container
            size="xl"
            px={{ base: 16, sm: 24, md: 32 }}
            py={{ base: 24, md: 32 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Container>
        </Box>
        <Footer />
        <MobileBottomNav />
      </AppShell.Main>
    </AppShell>
  );
};