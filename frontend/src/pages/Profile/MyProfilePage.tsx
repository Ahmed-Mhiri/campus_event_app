import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Stack,
  Avatar,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Rating,
  Skeleton,
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
import { DeleteAccountModal } from '@/components/molecules/DeleteAccountModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export function MyProfilePage() {
  const { user } = useAuth();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const { useHostReviews } = useReviews();
  const { data: hostReviews, isLoading: reviewsLoading } = useHostReviews(user?.id || '', 0, 5);
  const reviews = hostReviews?.content || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  if (!user) {
    return (
      <Container py="xl">
        <Text>Please log in to view your profile.</Text>
      </Container>
    );
  }

  const avatarSrc = user.profileImageUrl || getAvatarUrl(user.id) || undefined;

  return (
    <Container size="md" py="xl">
      <PageHeader title="My Profile" />

      <Card variant="elevated" className="text-center">
        <Stack align="center" gap="md">
          <Avatar
            src={avatarSrc}
            size={120}
            radius="xl"
            alt={user.displayName}
            className="border-4 border-slate-200 dark:border-slate-700"
          />
          <Title order={2}>{user.displayName}</Title>
          <Text c="dimmed" size="sm">{user.universityEmail}</Text>
          <Group gap="xs">
            <Badge
              radius="md"
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
            <Badge radius="md" color="blue">{user.role}</Badge>
          </Group>
          {user.bio && <Text ta="center" maw={400}>{user.bio}</Text>}
        </Stack>

        <Divider my="xl" />

        <Stack align="center" gap="xs" mb="xl">
          <Text fw={500}>Host Rating</Text>
          {reviewsLoading ? (
            <Skeleton height={30} width={150} />
          ) : (
            <>
              <Rating value={averageRating} readOnly fractions={2} size="lg" />
              <Text size="sm" c="dimmed">
                {hostReviews?.totalElements || 0} reviews • {averageRating.toFixed(1)} average
              </Text>
            </>
          )}
        </Stack>

        <Divider my="xl" />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Button
            component={Link}
            to={ROUTES.EDIT_PROFILE}
            leftSection={<IconUserEdit size={18} aria-hidden="true" />}
            variant="outline"
            fullWidth
            radius="md"
            aria-label="Edit profile"
          >
            Edit Profile
          </Button>
          <Button
            component={Link}
            to={ROUTES.CHANGE_PASSWORD}
            leftSection={<IconLock size={18} aria-hidden="true" />}
            variant="outline"
            fullWidth
            radius="md"
            aria-label="Change password"
          >
            Change Password
          </Button>
          <Button
            component={Link}
            to={ROUTES.PREFERENCES}
            leftSection={<IconBell size={18} aria-hidden="true" />}
            variant="outline"
            fullWidth
            radius="md"
            aria-label="Preferences"
          >
            Preferences
          </Button>
          <Button
            component={Link}
            to={ROUTES.TRUST_STATUS}
            leftSection={<IconShield size={18} aria-hidden="true" />}
            variant="outline"
            fullWidth
            radius="md"
            aria-label="Trust status"
          >
            Trust Status
          </Button>
        </SimpleGrid>

        <Divider my="xl" />

        <Button
          color="red"
          variant="light"
          leftSection={<IconTrash size={18} aria-hidden="true" />}
          fullWidth
          onClick={() => setDeleteModalOpened(true)}
          radius="md"
          aria-label="Delete account"
        >
          Delete Account
        </Button>
      </Card>

      <DeleteAccountModal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} />
    </Container>
  );
}