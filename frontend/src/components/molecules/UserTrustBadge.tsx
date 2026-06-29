// src/components/molecules/UserTrustBadge/UserTrustBadge.tsx
import { TrustLevel } from '@/constants/enums';
import { Badge, Tooltip } from '@mantine/core';
import { IconCheck, IconAlertCircle, IconUser } from '@tabler/icons-react';

interface UserTrustBadgeProps {
  trustLevel: TrustLevel | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showLabel?: boolean;
}

const trustConfig: Record<
  TrustLevel | string,
  {
    color: string;
    label: string;
    icon: React.ReactNode;
    tooltip: string;
  }
> = {
  NEW: {
    color: 'gray',
    label: 'New',
    icon: <IconUser size={12} />,
    tooltip: 'New user – events require review',
  },
  TRUSTED_HOST: {
    color: 'green',
    label: 'Trusted Host',
    icon: <IconCheck size={12} />,
    tooltip: 'Trusted host – events auto-publish',
  },
  FLAGGED: {
    color: 'red',
    label: 'Flagged',
    icon: <IconAlertCircle size={12} />,
    tooltip: 'Account flagged – contact support',
  },
};

export function UserTrustBadge({
  trustLevel,
  size = 'sm',
  showIcon = true,
  showLabel = true,
}: UserTrustBadgeProps) {
  const config = trustConfig[trustLevel] || trustConfig.NEW;

  return (
    <Tooltip label={config.tooltip} withArrow position="top">
      <Badge
        color={config.color}
        size={size}
        variant="light"
        leftSection={showIcon ? config.icon : undefined}
        styles={{
          root: {
            textTransform: 'capitalize',
            fontWeight: 500,
          },
        }}
      >
        {showLabel ? config.label : ''}
      </Badge>
    </Tooltip>
  );
}