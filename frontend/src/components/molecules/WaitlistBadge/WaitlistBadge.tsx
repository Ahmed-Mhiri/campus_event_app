export const WaitlistBadge: React.FC<{ position: number | null }> = ({ position }) => position !== null ? <span>Waitlist #{position}</span> : null;
