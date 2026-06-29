// src/components/molecules/CategoryChip/CategoryChip.tsx
import { Badge } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface CategoryChipProps {
  name: string;
  color?: string;
  categoryId?: string | number;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function CategoryChip({
  name,
  color = 'gray',
  categoryId,
  onClick,
  size = 'sm',
}: CategoryChipProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (categoryId) {
      navigate(`${ROUTES.EVENTS}?categoryId=${categoryId}`);
    }
  };

  return (
    <Badge
      color={color}
      variant="light"
      size={size}
      radius="xl"
      style={{ cursor: categoryId || onClick ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {name}
    </Badge>
  );
}