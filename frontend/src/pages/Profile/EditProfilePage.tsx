import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Avatar,
  Group,
  FileButton, // ✅ Swapped FileInput for FileButton
  Divider,
  Text,
} from '@mantine/core';
import { IconUpload, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getAvatarUrl } from '@/utils/fileHelpers';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { slideUp } from '@/design-system/animations';

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

  if (!user) return null;

  const avatarSrc = avatarPreview || user.profileImageUrl || getAvatarUrl(user.id) || undefined;

  return (
    <PageContainer size="md">
      <Stack gap="xl">
        <PageHeader
          title="Edit Profile"
          subtitle="Update your public information"
          breadcrumbs={[
            { label: 'Profile', href: ROUTES.PROFILE },
            { label: 'Edit Profile' },
          ]}
        />

        <motion.div initial="hidden" animate="visible" variants={slideUp}>
          <Card variant="default" className="border-slate-200/80 dark:border-slate-700/60">
            <form onSubmit={handleSubmit}>
              <Stack gap="xl">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar
                      src={avatarSrc}
                      size={120}
                      radius="xl"
                      alt="Avatar preview"
                      className="shadow-md"
                      style={{ border: '4px solid var(--app-border)' }}
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {/* ✅ FIXED: Using FileButton to wrap a custom clickable button */}
                      <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
                        {(props) => (
                          <button
                            {...props}
                            type="button"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white shadow-lg cursor-pointer hover:bg-violet-700 transition-colors border-none outline-none"
                            aria-label="Upload profile photo"
                          >
                            <IconUpload size={18} />
                          </button>
                        )}
                      </FileButton>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <Text fw={600} style={{ color: 'var(--app-text)' }}>
                      Profile Photo
                    </Text>
                    <Text size="sm" style={{ color: 'var(--app-text-secondary)' }}>
                      JPG, PNG or WebP. Max 5MB. A square image works best.
                    </Text>
                  </div>
                </div>

                <Divider style={{ borderColor: 'var(--app-border)' }} />

                {/* Fields */}
                <Stack gap="md">
                  <TextInput
                    label="Display Name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.currentTarget.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    radius="md"
                    size="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                  <Textarea
                    label="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.currentTarget.value)}
                    placeholder="Tell us about yourself (max 500 characters)"
                    maxLength={500}
                    autosize
                    minRows={3}
                    radius="md"
                    styles={{ label: { color: 'var(--app-text)' } }}
                  />
                </Stack>

                {/* Actions */}
                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="default"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate(ROUTES.PROFILE)}
                    radius="md"
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isUpdatingProfile}
                    leftSection={<IconCheck size={16} />}
                    radius="md"
                    size="md"
                    color="brand"
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </motion.div>
      </Stack>
    </PageContainer>
  );
}