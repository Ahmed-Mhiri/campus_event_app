// src/pages/Profile/EditProfilePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Stack,
  TextInput,
  Textarea,
  FileInput,
  Button,
  Avatar,
  Group,
  Loader,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('displayName', displayName);
    if (bio) formData.append('bio', bio);
    if (avatarFile) formData.append('profileImage', avatarFile);

    await updateProfile(formData);
    navigate(ROUTES.PROFILE);
  };

  if (!user) return <Loader />;

  // Ensure avatar src is string | null | undefined
  const avatarSrc = avatarPreview || user.profileImageUrl || getAvatarUrl(user.id) || undefined;

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="lg">
          Edit Profile
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group align="end">
              <Avatar
                src={avatarSrc != null ? String(avatarSrc) : undefined}
                size={80}
                radius="xl"
                alt="Avatar preview"
              />
              <FileInput
                label="Profile Image"
                placeholder="Upload new image"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                leftSection={<IconUpload size={18} />}
                style={{ flex: 1 }}
              />
            </Group>

            <TextInput
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              required
              minLength={2}
              maxLength={50}
            />

            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.currentTarget.value)}
              placeholder="Tell us about yourself (max 500 characters)"
              maxLength={500}
              autosize
              minRows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate(ROUTES.PROFILE)}>
                Cancel
              </Button>
              <Button type="submit" loading={isUpdatingProfile}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}