import { Box, Container, Stack, Title, Text, Badge, Button, Paper } from '@mantine/core';
import { IconSparkles, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { SearchBar } from '../molecules/SearchBar';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box
      py={{ base: '3rem', md: '5rem' }}
      style={{
        background: 'linear-gradient(135deg, var(--app-primary) 0%, #a855f7 50%, #ec4899 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(80px)',
        }}
      />

      <Container size="xl" px={{ base: 16, sm: 24, md: 32 }} style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          <Badge
            size="lg"
            radius="xl"
            variant="filled"
            color="white"
            c="brand"
            leftSection={<IconSparkles size={14} />}
          >
            Campus Event Platform
          </Badge>

          <Title
            order={1}
            size="h1"
            ta="center"
            c="white"
            style={{ maxWidth: 700, textWrap: 'balance' }}
          >
            Discover Amazing Events at Your University
          </Title>

          <Text size="xl" ta="center" c="rgba(255,255,255,0.9)" maw={600}>
            Find events, connect with students, and make the most of your campus life.
          </Text>

          <Box maw={600} w="100%">
            <Paper radius="xl" p="xs" shadow="xl" withBorder>
              <SearchBar size="lg" placeholder="Search events, users, categories..." />
            </Paper>
          </Box>

          <Stack gap="sm" align="center">
            <Button
              size="lg"
              radius="xl"
              variant="white"
              color="brand"
              leftSection={<IconPlus size={18} />}
              onClick={() => navigate(ROUTES.CREATE_EVENT)}
            >
              Create Event
            </Button>
            <Button
              size="lg"
              radius="xl"
              variant="outline"
              color="white"
              onClick={() => navigate(ROUTES.EVENTS)}
            >
              Browse Events
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}