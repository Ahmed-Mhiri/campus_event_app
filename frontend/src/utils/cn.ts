export const cn = (...classes: (string | undefined | null)[]) => classes.filter(Boolean).join(' ');
