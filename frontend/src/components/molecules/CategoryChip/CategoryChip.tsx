export const CategoryChip: React.FC<{ name: string; color?: string }> = ({ name, color }) => <span style={{ backgroundColor: color || '#ddd' }}>{name}</span>;
