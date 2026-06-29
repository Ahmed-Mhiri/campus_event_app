// src/components/templates/AuthLayout/AuthLayout.tsx

import { Outlet } from 'react-router-dom';
import { Container, Paper, Title, Stack } from '@mantine/core';

export const AuthLayout = () => {
  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Stack>
          <Title order={2} ta="center" c="blue">
            MyStudyApp
          </Title>
          <Outlet />
        </Stack>
      </Paper>
    </Container>
  );
};