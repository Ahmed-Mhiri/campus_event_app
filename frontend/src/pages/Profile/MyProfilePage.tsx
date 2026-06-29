// src/pages/Profile/MyProfilePage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Stack,
  Avatar,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Rating,
} from '@mantine/core';
import {
  IconUserEdit,
  IconLock,
  IconBell,
  IconShield,
  IconTrash,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { DeleteAccountModal } from '@/components/molecules/DeleteAccountModal/DeleteAccountModal';

export function MyProfilePage() {
  const { user } = useAuth();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  // Fetch host reviews summary
  const { useHostReviews } = useReviews();
  const { data: hostReviews } = useHostReviews(user?.id || '', 0, 5);
  const reviews = hostReviews?.content || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  if (!user) {
    return (
      <Container>
        <Text>Please log in to view your profile.</Text>
      </Container>
    );
  }

  // Ensure avatar src is string | null | undefined
  const avatarSrc = user.profileImageUrl || getAvatarUrl(user.id) || undefined;

  return (
    <>
      <Container size="md" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Stack align="center" gap="md">
            <Avatar
              src={avatarSrc != null ? String(avatarSrc) : undefined}

              size={120}
              radius="xl"
              alt={user.displayName}
            />
            <Title order={2}>{user.displayName}</Title>
            <Text c="dimmed" size="sm">
              {user.universityEmail}
            </Text>
            <Group gap="xs">
              <Badge
                color={
                  user.trustLevel === 'TRUSTED_HOST'
                    ? 'green'
                    : user.trustLevel === 'FLAGGED'
                      ? 'red'
                      : 'gray'
                }
              >
                {user.trustLevel}
              </Badge>
              <Badge color="blue">{user.role}</Badge>
            </Group>
            {user.bio && (
              <Text ta="center" maw={400}>
                {user.bio}
              </Text>
            )}
          </Stack>

          <Divider my="xl" />

          {/* Host Rating Summary */}
          <Stack align="center" gap="xs" mb="xl">
            <Text fw={500}>Host Rating</Text>
            <Rating value={averageRating} readOnly fractions={2} size="lg" />
            <Text size="sm" c="dimmed">
              {hostReviews?.totalElements || 0} reviews • {averageRating.toFixed(1)} ⭐ average
            </Text>
          </Stack>

          <Divider my="xl" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Button
              component={Link}
              to={ROUTES.EDIT_PROFILE}
              leftSection={<IconUserEdit size={18} />}
              variant="outline"
              fullWidth
            >
              Edit Profile
            </Button>
            <Button
              component={Link}
              to={ROUTES.CHANGE_PASSWORD}
              leftSection={<IconLock size={18} />}
              variant="outline"
              fullWidth
            >
              Change Password
            </Button>
            <Button
              component={Link}
              to={ROUTES.PREFERENCES}
              leftSection={<IconBell size={18} />}
              variant="outline"
              fullWidth
            >
              Preferences
            </Button>
            <Button
              component={Link}
              to={ROUTES.TRUST_STATUS}
              leftSection={<IconShield size={18} />}
              variant="outline"
              fullWidth
            >
              Trust Status
            </Button>
          </SimpleGrid>

          <Divider my="xl" />

          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={18} />}
            fullWidth
            onClick={() => setDeleteModalOpened(true)}
          >
            Delete Account
          </Button>
        </Paper>
      </Container>

      <DeleteAccountModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
      />
    </>
  );
}