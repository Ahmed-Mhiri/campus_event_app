# MYSTUDYAPP UI/UX TRANSFORMATION PLAN
## A Phased, Production-Ready Improvement Roadmap

---

## PHASE 0: FOUNDATION (Week 1) — "Fix the Bones"
*Goal: Establish design tokens, theme, and global patterns before touching components*

### 0.1 Design Token System
Create `src/design-system/tokens.ts`:

```typescript
// ===== COLORS =====
export const colors = {
  // Primary brand — energetic purple-indigo (campus vibe)
  primary: {
    50: '#f0f1ff',
    100: '#e0e2fe',
    200: '#c7cafc',
    300: '#a5a8f7',
    400: '#8b8af0',
    500: '#7c6ae6',  // main
    600: '#6d4fd0',
    700: '#5c40b2',
    800: '#4c3592',
    900: '#3f2e78',
  },
  // Semantic
  success: { light: '#dcfce7', main: '#22c55e', dark: '#15803d' },
  warning: { light: '#fef9c3', main: '#eab308', dark: '#a16207' },
  error:   { light: '#fee2e2', main: '#ef4444', dark: '#b91c1c' },
  info:    { light: '#dbeafe', main: '#3b82f6', dark: '#1d4ed8' },
  // Surfaces
  background: { light: '#fafafa', dark: '#0f0f13' },
  surface:    { light: '#ffffff', dark: '#1a1a1f' },
  elevated:   { light: '#ffffff', dark: '#24242a' },
  // Text
  text: {
    primary:   { light: '#111827', dark: '#f9fafb' },
    secondary: { light: '#6b7280', dark: '#9ca3af' },
    muted:     { light: '#9ca3af', dark: '#6b7280' },
  },
  // Borders
  border: { light: '#e5e7eb', dark: '#374151' },
  borderLight: { light: '#f3f4f6', dark: '#1f2937' },
};

// ===== SPACING =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// ===== TYPOGRAPHY =====
export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyDisplay: '"Inter", sans-serif', // Could use a display font like "Space Grotesk"
  scale: {
    xs:   { size: '0.75rem',  lineHeight: 1.5,  letterSpacing: '0.01em', weight: 400 },
    sm:   { size: '0.875rem', lineHeight: 1.5,  letterSpacing: '0',      weight: 400 },
    base: { size: '1rem',     lineHeight: 1.6,  letterSpacing: '-0.01em', weight: 400 },
    lg:   { size: '1.125rem', lineHeight: 1.5,  letterSpacing: '-0.01em', weight: 500 },
    xl:   { size: '1.25rem',  lineHeight: 1.4,  letterSpacing: '-0.02em', weight: 600 },
    '2xl':{ size: '1.5rem',   lineHeight: 1.3,  letterSpacing: '-0.02em', weight: 600 },
    '3xl':{ size: '1.875rem', lineHeight: 1.2,  letterSpacing: '-0.03em', weight: 700 },
    '4xl':{ size: '2.25rem',   lineHeight: 1.1,  letterSpacing: '-0.03em', weight: 700 },
    '5xl':{ size: '3rem',      lineHeight: 1,    letterSpacing: '-0.04em', weight: 800 },
  },
};

// ===== SHADOWS (Elevation) =====
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
  glow: '0 0 20px rgba(124, 106, 230, 0.15)',
};

// ===== BREAKPOINTS =====
export const breakpoints = {
  xs: '30em',   // 480px
  sm: '40em',   // 640px
  md: '48em',   // 768px
  lg: '64em',   // 1024px
  xl: '80em',   // 1280px
  '2xl': '96em', // 1536px
};

// ===== TRANSITIONS =====
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ===== BORDER RADIUS =====
export const radius = {
  none: '0',
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};
```

### 0.2 Enhanced Mantine Theme
Rewrite `mantineTheme.ts`:

```typescript
import { createTheme, rem } from '@mantine/core';
import { colors, shadows, radius, typography } from './tokens';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      colors.primary[50],
      colors.primary[100],
      colors.primary[200],
      colors.primary[300],
      colors.primary[400],
      colors.primary[500],
      colors.primary[600],
      colors.primary[700],
      colors.primary[800],
      colors.primary[900],
    ],
  },
  
  fontFamily: typography.fontFamily,
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  
  headings: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(48), lineHeight: '1.1', fontWeight: '800' },
      h2: { fontSize: rem(36), lineHeight: '1.2', fontWeight: '700' },
      h3: { fontSize: rem(28), lineHeight: '1.25', fontWeight: '600' },
      h4: { fontSize: rem(22), lineHeight: '1.3', fontWeight: '600' },
      h5: { fontSize: rem(18), lineHeight: '1.4', fontWeight: '600' },
      h6: { fontSize: rem(16), lineHeight: '1.5', fontWeight: '600' },
    },
  },
  
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
    '2xl': rem(48),
    '3xl': rem(64),
  },
  
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(16),
    xl: rem(24),
  },
  
  shadows: {
    xs: shadows.sm,
    sm: shadows.md,
    md: shadows.lg,
    lg: shadows.xl,
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  },
  
  defaultRadius: 'md',
  defaultGradient: { from: 'brand.5', to: 'brand.7', deg: 135 },
  
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': { transform: 'scale(0.97)' },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'lg',
      },
      styles: {
        root: {
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid var(--mantine-color-gray-2)',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'border-color 150ms, box-shadow 150ms',
          '&:focus': {
            boxShadow: '0 0 0 3px rgba(124, 106, 230, 0.1)',
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'none', // Don't force uppercase
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
        padding: 'xl',
      },
    },
    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
    },
  },
  
  other: {
    // Custom properties accessible via theme.other
    headerHeight: rem(64),
    headerHeightMobile: rem(56),
    maxContentWidth: rem(1280),
    contentPadding: { base: rem(16), sm: rem(24), md: rem(32) },
  },
});
```

### 0.3 Global CSS Improvements
Create `src/design-system/global.css`:

```css
/* ===== CSS Custom Properties for light/dark ===== */
:root {
  --app-bg: #fafafa;
  --app-surface: #ffffff;
  --app-elevated: #ffffff;
  --app-text: #111827;
  --app-text-secondary: #6b7280;
  --app-text-muted: #9ca3af;
  --app-border: #e5e7eb;
  --app-border-light: #f3f4f6;
  --app-primary: #7c6ae6;
  --app-primary-light: rgba(124, 106, 230, 0.1);
}

[data-mantine-color-scheme="dark"] {
  --app-bg: #0f0f13;
  --app-surface: #1a1a1f;
  --app-elevated: #24242a;
  --app-text: #f9fafb;
  --app-text-secondary: #9ca3af;
  --app-text-muted: #6b7280;
  --app-border: #374151;
  --app-border-light: #1f2937;
  --app-primary: #a5a8f7;
  --app-primary-light: rgba(165, 168, 247, 0.1);
}

/* ===== Smooth scrolling ===== */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Selection color ===== */
::selection {
  background: rgba(124, 106, 230, 0.2);
  color: inherit;
}

/* ===== Focus visible (accessibility) ===== */
:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
}

/* ===== Scrollbar styling ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--app-text-muted);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--app-text-secondary);
}

/* ===== Reduced motion support ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== Utility classes ===== */
.app-gradient-text {
  background: linear-gradient(135deg, var(--app-primary) 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-surface {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.app-elevated {
  background: var(--app-elevated);
  border: 1px solid var(--app-border);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}
```

### 0.4 Animation Utilities
Create `src/design-system/animations.ts`:

```typescript
// Framer Motion variants (install: npm install framer-motion)
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { 
    y: -4, 
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
};

// CSS keyframes for skeleton shimmer
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
```

---

## PHASE 1: LAYOUT & STRUCTURE (Week 1-2) — "Fix the Frame"

### 1.1 Responsive PageLayout
Rewrite `PageLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import { AppShell, Container, Box } from '@mantine/core';
import { useHeadroom } from '@mantine/hooks'; // npm install @mantine/hooks
import { Navbar } from '@/components/organisms/Navbar/Navbar';
import { Footer } from '@/components/organisms/Footer/Footer'; // NEW

export const PageLayout = () => {
  const pinned = useHeadroom({ fixedAt: 120 });
  
  return (
    <AppShell 
      header={{ height: { base: 56, md: 64 } }}
      padding={0}
    >
      <AppShell.Header 
        style={{ 
          transform: pinned ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 200ms ease',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid var(--app-border)',
        }}
      >
        <Navbar />
      </AppShell.Header>
      
      <AppShell.Main>
        <Box 
          component="main"
          style={{ minHeight: 'calc(100vh - 200px)' }} // Reserve space for footer
        >
          <Container 
            size="xl" 
            px={{ base: 16, sm: 24, md: 32 }}
            py={{ base: 24, md: 32 }}
          >
            <Outlet />
          </Container>
        </Box>
        <Footer />
      </AppShell.Main>
    </AppShell>
  );
};
```

### 1.2 Section Component (NEW)
Create `src/components/atoms/Section/Section.tsx`:

```tsx
import { Box, Title, Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/design-system/animations';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  withBackground?: boolean;
  py?: number | string;
}

export function Section({ title, subtitle, children, withBackground, py = '3rem' }: SectionProps) {
  return (
    <Box 
      component={motion.section}
      py={py}
      bg={withBackground ? 'var(--app-border-light)' : undefined}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <Stack gap="lg">
        {(title || subtitle) && (
          <Box component={motion.div} variants={slideUp}>
            {title && (
              <Title order={2} size="h3" mb={subtitle ? 'xs' : 0}>
                {title}
              </Title>
            )}
            {subtitle && (
              <Text c="dimmed" size="lg" maw={600}>
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        <Box component={motion.div} variants={slideUp}>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}
```

### 1.3 Page Header Component (NEW)
Create `src/components/molecules/PageHeader/PageHeader.tsx`:

```tsx
import { Box, Title, Text, Breadcrumbs, Anchor, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideUp } from '@/design-system/animations';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box component={motion.div} variants={slideUp} mb="xl">
      <Stack gap="sm">
        {breadcrumbs && (
          <Breadcrumbs>
            {breadcrumbs.map((item, i) => 
              item.href ? (
                <Anchor component={Link} to={item.href} key={i} size="sm">
                  {item.label}
                </Anchor>
              ) : (
                <Text size="sm" c="dimmed" key={i}>{item.label}</Text>
              )
            )}
          </Breadcrumbs>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <Title order={1} size="h2">{title}</Title>
            {subtitle && <Text c="dimmed" size="lg" mt="xs">{subtitle}</Text>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </Stack>
    </Box>
  );
}
```

---

## PHASE 2: COMPONENT POLISH (Week 2-3) — "Make It Shine"

### 2.1 Enhanced EventCard
Rewrite key parts:

```tsx
// Add these improvements:

// 1. Hover lift animation wrapper
<motion.div
  initial="rest"
  whileHover="hover"
  animate="rest"
  variants={cardHover}
  style={{ height: '100%' }}
>
  <Card 
    component={Link}
    to={ROUTES.EVENT_DETAIL(slug)}
    shadow="sm"
    padding="lg"
    radius="lg"
    withBorder
    style={{ 
      textDecoration: 'none', 
      color: 'inherit', 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* 2. Image overlay gradient for text readability */}
    <Card.Section style={{ position: 'relative' }}>
      <Image
        src={coverImage || '/placeholder-event.jpg'}
        height={200} // Increased from 160
        alt={title}
        fallbackSrc="/placeholder-event.jpg"
        style={{ transition: 'transform 300ms ease' }}
      />
      {/* Status badge positioned absolute top-right */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
        {isCancelled && <Badge color="red" variant="filled" radius="md">Cancelled</Badge>}
        {isCompleted && <Badge color="gray" variant="filled" radius="md">Completed</Badge>}
        {status === 'PUBLISHED' && !isFull && <Badge color="green" variant="filled" radius="md">Open</Badge>}
        {status === 'PUBLISHED' && isFull && <Badge color="orange" variant="filled" radius="md">Full</Badge>}
        {isHost && <Badge color="blue" variant="light" leftSection={<IconCrown size={12} />}>Your Event</Badge>}
      </div>
    </Card.Section>

    <Stack gap="xs" mt="md" style={{ flex: 1 }}>
      {/* 3. Better title with line clamp */}
      <Text fw={700} size="lg" lineClamp={2} lh={1.3}>
        {title}
      </Text>
      
      {/* 4. Categories as compact chips */}
      {categories.length > 0 && (
        <Group gap={6}>
          {categories.slice(0, 3).map((cat) => (
            <CategoryChip key={cat.id} name={cat.name} color={cat.color} size="xs" />
          ))}
        </Group>
      )}
      
      {/* 5. Compact meta info */}
      <Group gap="xs" c="dimmed">
        <IconCalendar size={14} />
        <Text size="sm">{formatDateShort(startTime)}</Text>
      </Group>
      
      <Group gap="xs" c="dimmed">
        <IconMapPin size={14} />
        <Text size="sm" lineClamp={1}>{location}</Text>
      </Group>
      
      {/* 6. Host info */}
      <Group gap="xs" align="center" mt="auto" pt="sm">
        <Avatar src={avatarSrc} size={28} radius="xl" />
        <Text size="sm" fw={500}>{host.displayName}</Text>
        <UserTrustBadge trustLevel={host.trustLevel} size="xs" showLabel={false} />
      </Group>
      
      {/* 7. Capacity bar */}
      <CapacityBar current={currentRsvpCount} max={maxCapacity} size="sm" />
      
      {/* 8. RSVP button - separate from card click */}
      <Button
        size="sm"
        radius="md"
        variant={myRsvpStatus === 'GOING' ? 'filled' : 'light'}
        color={myRsvpStatus === 'GOING' ? 'green' : 'brand'}
        fullWidth
        disabled={isCancelled || isCompleted}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Handle RSVP
        }}
        style={{ marginTop: 'auto' }}
      >
        {rsvpLabel}
      </Button>
    </Stack>
  </Card>
</motion.div>
```

### 2.2 Enhanced Skeleton Loading
Create `src/components/atoms/SkeletonCard/SkeletonCard.tsx`:

```tsx
import { Card, Skeleton, Stack } from '@mantine/core';

export function SkeletonCard() {
  return (
    <Card radius="lg" padding="lg" withBorder>
      <Skeleton height={200} radius="md" mb="md" />
      <Skeleton height={24} radius="sm" mb="xs" width="80%" />
      <Skeleton height={16} radius="sm" mb="xs" width="40%" />
      <Skeleton height={16} radius="sm" mb="md" width="60%" />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Skeleton circle height={28} />
        <Skeleton height={16} radius="sm" width="30%" />
      </div>
    </Card>
  );
}
```

### 2.3 Empty State Component (NEW)
Create `src/components/molecules/EmptyState/EmptyState.tsx`:

```tsx
import { Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconSearchOff, IconCalendarOff } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: 'search' | 'calendar' | React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const Icon = icon === 'search' ? IconSearchOff : icon === 'calendar' ? IconCalendarOff : null;
  
  return (
    <Stack align="center" py="4rem" gap="md">
      <ThemeIcon size={64} radius="xl" variant="light" color="gray">
        {typeof icon === 'string' && Icon ? <Icon size={32} /> : icon}
      </ThemeIcon>
      <Text fw={600} size="lg" ta="center">{title}</Text>
      {description && <Text c="dimmed" ta="center" maw={400}>{description}</Text>}
      {action && <Button onClick={action.onClick} variant="light">{action.label}</Button>}
    </Stack>
  );
}
```

---

## PHASE 3: PAGE TRANSFORMATIONS (Week 3-4) — "Bring Pages to Life"

### 3.1 HomePage Redesign
```tsx
export function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const navigate = useNavigate();

  return (
    <Stack gap={0}>
      {/* HERO SECTION */}
      <Box 
        py={{ base: '3rem', md: '5rem' }}
        style={{
          background: 'linear-gradient(135deg, var(--app-primary) 0%, #a855f7 50%, #ec4899 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)'
        }} />
        
        <Container size="xl" px={{ base: 16, sm: 24, md: 32 }} style={{ position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="xl">
            <Badge 
              size="lg" 
              radius="xl" 
              variant="filled"
              color="white"
              c="brand"
              leftSection={<IconSparkles size={14} />}
            >
              Campus Event Platform
            </Badge>
            
            <Title 
              order={1} 
              size="h1" 
              ta="center" 
              c="white"
              style={{ maxWidth: 700, textWrap: 'balance' }}
            >
              Discover Amazing Events at Your University
            </Title>
            
            <Text size="xl" ta="center" c="rgba(255,255,255,0.9)" maw={600}>
              Find events, connect with students, and make the most of your campus life.
            </Text>
            
            {/* Search bar in hero */}
            <Box maw={600} w="100%">
              <Paper radius="xl" p="xs" shadow="xl" withBorder>
                <SearchBar size="lg" placeholder="Search events, users, categories..." />
              </Paper>
            </Box>
            
            <Group gap="sm">
              <Button 
                size="lg" 
                radius="xl" 
                variant="white" 
                color="brand"
                leftSection={<IconPlus size={18} />}
                onClick={() => navigate(ROUTES.CREATE_EVENT)}
              >
                Create Event
              </Button>
              <Button 
                size="lg" 
                radius="xl" 
                variant="outline" 
                color="white"
                onClick={() => navigate(ROUTES.EVENTS)}
              >
                Browse Events
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* CATEGORIES SECTION */}
      <Section title="Browse by Category" subtitle="Find events that match your interests">
        {categoriesLoading ? (
          <Group gap="sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={36} width={100} radius="xl" />
            ))}
          </Group>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {categories?.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CategoryChip 
                  name={cat.name} 
                  color={cat.color} 
                  categoryId={cat.id}
                  size="md"
                />
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* FEATURED EVENTS SECTION */}
      <Section 
        title="Featured Events" 
        subtitle="Hand-picked events you don't want to miss"
        withBackground
      >
        {featuredLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </SimpleGrid>
        ) : featuredEvents.length === 0 ? (
          <EmptyState 
            icon="calendar"
            title="No featured events yet"
            description="Check back soon for exciting events!"
            action={{ label: 'Browse all events', onClick: () => navigate(ROUTES.EVENTS) }}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </SimpleGrid>
        )}
      </Section>

      {/* HOW IT WORKS SECTION */}
      <Section title="How It Works">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
          {[
            { icon: IconSearch, title: 'Discover', desc: 'Browse events by category, date, or location' },
            { icon: IconCalendarPlus, title: 'Register', desc: 'RSVP with one click and get reminders' },
            { icon: IconUsers, title: 'Connect', desc: 'Meet new people and build your network' },
          ].map((item, i) => (
            <Paper key={i} p="xl" radius="lg" withBorder ta="center">
              <ThemeIcon size={56} radius="xl" color="brand" variant="light" mb="md">
                <item.icon size={28} />
              </ThemeIcon>
              <Text fw={600} size="lg" mb="xs">{item.title}</Text>
              <Text c="dimmed" size="sm">{item.desc}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Section>
    </Stack>
  );
}
```

### 3.2 EventsPage Filter Bar Redesign
```tsx
// Replace the plain Paper filter bar with:
<Paper 
  withBorder 
  p="lg" 
  radius="lg"
  style={{ 
    background: 'var(--app-surface)',
    position: 'sticky',
    top: 80,
    zIndex: 10,
  }}
>
  <Grid align="end" gutter="md">
    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
      <TextInput
        label="Search"
        placeholder="Search events..."
        leftSection={<IconSearch size={16} />}
        radius="md"
      />
    </Grid.Col>
    {/* ... other filters ... */}
    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
      <Group gap="sm">
        <Button 
          leftSection={<IconFilter size={16} />}
          onClick={applyFilters}
          radius="md"
        >
          Apply Filters
        </Button>
        <Button 
          variant="subtle" 
          leftSection={<IconX size={16} />}
          onClick={clearFilters}
          radius="md"
        >
          Clear
        </Button>
      </Group>
    </Grid.Col>
  </Grid>
  
  {/* Active filter chips */}
  {hasActiveFilters && (
    <Group gap="xs" mt="md">
      <Text size="sm" c="dimmed">Active:</Text>
      {/* Render active filter chips with remove buttons */}
    </Group>
  )}
</Paper>
```

### 3.3 EventDetailPage Sidebar Improvements
```tsx
// Make sidebar sticky and add visual hierarchy
<Grid.Col span={{ base: 12, md: 4 }}>
  <div style={{ position: 'sticky', top: 80 }}>
    <Stack gap="md">
      {/* Main action card */}
      <Paper 
        withBorder 
        p="xl" 
        radius="lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--app-surface) 0%, var(--app-border-light) 100%)',
        }}
      >
        <Stack gap="lg">
          {/* Date */}
          <Group gap="md" align="flex-start">
            <ThemeIcon size={40} radius="md" color="brand" variant="light">
              <IconCalendar size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{formatDateLong(startTime)}</Text>
              <Text size="sm" c="dimmed">{formatTimeRange(startTime, endTime)}</Text>
            </div>
          </Group>
          
          {/* Location */}
          <Group gap="md" align="flex-start">
            <ThemeIcon size={40} radius="md" color="brand" variant="light">
              <IconMapPin size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{location}</Text>
              <Text size="sm" c="dimmed">Event Location</Text>
            </div>
          </Group>
          
          <Divider />
          
          {/* Capacity */}
          <CapacityBar current={currentRsvpCount} max={maxCapacity} showLabels />
          
          <Divider />
          
          {/* RSVP Button */}
          <RSVPButton 
            eventId={id}
            status={myRsvpStatus}
            isFull={isFull}
            isCancelled={isCancelled}
            isCompleted={isCompleted}
          />
          
          {/* Share */}
          <Button 
            variant="light" 
            color="gray" 
            leftSection={<IconShare size={16} />}
            onClick={() => {/* Copy link */}}
          >
            Share Event
          </Button>
        </Stack>
      </Paper>
      
      {/* Host card */}
      <Paper withBorder p="lg" radius="lg">
        <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">Hosted by</Text>
        <HostCard host={host} />
      </Paper>
    </Stack>
  </div>
</Grid.Col>
```

---

## PHASE 4: NAVBAR & GLOBAL COMPONENTS (Week 4) — "The First Impression"

### 4.1 Redesigned Navbar
```tsx
export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Group h="100%" px={{ base: 16, md: 24 }} justify="space-between" wrap="nowrap">
      {/* Logo with icon */}
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" color="brand" variant="filled">
          <IconSchool size={20} />
        </ThemeIcon>
        <Text
          component={Link}
          to={ROUTES.HOME}
          size="xl"
          fw={800}
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            letterSpacing: '-0.03em',
          }}
        >
          MyStudy
          <span style={{ color: 'var(--app-primary)' }}>App</span>
        </Text>
      </Group>

      {/* Desktop Search */}
      {!isMobile && (
        <Box style={{ flex: 1, maxWidth: 480, margin: '0 24px' }}>
          <SearchBar placeholder="Search events..." size="sm" />
        </Box>
      )}

      {/* Right side actions */}
      <Group gap="xs" wrap="nowrap">
        <ActionIcon 
          onClick={toggleColorScheme} 
          variant="subtle" 
          size="lg"
          radius="md"
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>

        <NotificationDropdown />

        {user ? (
          <Menu position="bottom-end" withArrow offset={4}>
            <Menu.Target>
              <UnstyledButton style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                  src={user.profileImageUrl || getAvatarUrl(user.id)}
                  radius="xl"
                  size="md"
                  style={{ cursor: 'pointer', border: '2px solid var(--app-border)' }}
                  alt={user.displayName}
                />
                {!isMobile && (
                  <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 120 }}>
                    {user.displayName}
                  </Text>
                )}
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              {/* ... menu items ... */}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group gap="xs">
            <Button component={Link} to={ROUTES.LOGIN} variant="subtle" radius="md">
              Log In
            </Button>
            <Button component={Link} to={ROUTES.REGISTER} radius="md">
              Get Started
            </Button>
          </Group>
        )}
        
        {/* Mobile hamburger */}
        {isMobile && (
          <ActionIcon 
            variant="subtle" 
            size="lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu2 size={24} />
          </ActionIcon>
        )}
      </Group>
      
      {/* Mobile drawer */}
      <Drawer 
        opened={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        size="xs"
        padding="md"
      >
        <Stack>
          <SearchBar placeholder="Search..." />
          <Divider />
          <NavLink component={Link} to={ROUTES.HOME} label="Home" leftSection={<IconHome size={18} />} />
          <NavLink component={Link} to={ROUTES.EVENTS} label="Events" leftSection={<IconCalendar size={18} />} />
          {/* ... */}
        </Stack>
      </Drawer>
    </Group>
  );
}
```

---

## PHASE 5: ANIMATIONS & POLISH (Week 4-5) — "The Feel"

### 5.1 Page Transitions
Wrap routes with AnimatePresence:

```tsx
// In App.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
```

### 5.2 Toast/Notification Improvements
```tsx
// In main.tsx, enhance Notifications:
<Notifications 
  position="top-right" 
  zIndex={1000}
  autoClose={4000}
  transitionDuration={300}
  limit={5}
/>
```

### 5.3 Button Loading States
```tsx
// Enhanced button with loading animation
<Button
  loading={isLoading}
  loaderProps={{ type: 'dots' }}
  // Mantine handles this, but ensure consistent usage
>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

---

## PHASE 6: ACCESSIBILITY (Week 5) — "Everyone Can Use It"

### 6.1 Required Changes:
- Add `aria-label` to ALL Icon-only buttons
- Ensure color contrast ratios ≥ 4.5:1 for text
- Add `prefers-reduced-motion` media query support
- Implement skip-to-content link
- Add focus trapping to modals (Mantine does this, verify)
- Use semantic HTML (`<main>`, `<nav>`, `<article>`)
- Add `aria-live` regions for dynamic content

### 6.2 Focus States:
```css
/* Already in global.css */
:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
}
```

---

## PHASE 7: ADVANCED FEATURES (Week 5-6) — "The Wow Factor"

### 7.1 Image Loading with Blur-Up
```tsx
// Enhanced Image component
function ProgressiveImage({ src, alt, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {!loaded && <Skeleton height="100%" style={{ position: 'absolute', inset: 0 }} />}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ 
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease',
          ...props.style 
        }}
        {...props}
      />
    </div>
  );
}
```

### 7.2 Confetti on Event Creation
```tsx
// npm install canvas-confetti
import confetti from 'canvas-confetti';

// On successful event publish:
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#7c6ae6', '#a855f7', '#ec4899', '#22c55e']
});
```

### 7.3 Scroll-Triggered Animations
Already implemented in Section component using Framer Motion's `whileInView`.

---

## IMPLEMENTATION CHECKLIST

### Week 1: Foundation
- [ ] Install dependencies: `framer-motion`, `@mantine/hooks`, `canvas-confetti`
- [ ] Create design token system
- [ ] Rewrite mantineTheme.ts
- [ ] Create global.css with CSS variables
- [ ] Create animation utilities
- [ ] Test dark mode switching

### Week 2: Layout & Structure
- [ ] Rewrite PageLayout with sticky header
- [ ] Create Section component
- [ ] Create PageHeader component
- [ ] Create Footer component
- [ ] Implement mobile drawer navigation
- [ ] Add page transition animations

### Week 3: Component Polish
- [ ] Redesign EventCard with hover effects
- [ ] Create SkeletonCard component
- [ ] Create EmptyState component
- [ ] Redesign EventFeed with proper loading
- [ ] Enhance CapacityBar visual design
- [ ] Improve CategoryChip design

### Week 4: Page Transformations
- [ ] Redesign HomePage with hero section
- [ ] Redesign EventsPage with sticky filters
- [ ] Redesign EventDetailPage with sticky sidebar
- [ ] Improve EventForm with better grouping
- [ ] Polish auth pages with background patterns
- [ ] Enhance admin dashboard stats cards

### Week 5: Animations & Accessibility
- [ ] Add Framer Motion to all page transitions
- [ ] Implement scroll-triggered animations
- [ ] Add button press animations
- [ ] Add card hover lift effects
- [ ] Audit and fix all aria-labels
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios

### Week 6: Advanced Polish
- [ ] Implement progressive image loading
- [ ] Add confetti for key actions
- [ ] Create loading skeleton for all pages
- [ ] Add optimistic UI updates
- [ ] Implement share functionality
- [ ] Add event calendar integration UI
- [ ] Final responsive testing across devices

---

## NEW FILES TO CREATE

```
src/
├── design-system/
│   ├── tokens.ts              (NEW)
│   ├── animations.ts          (NEW)
│   ├── global.css             (NEW - replace index.css)
│   └── mantineTheme.ts        (REWRITE)
├── components/
│   ├── atoms/
│   │   ├── Section/           (NEW)
│   │   ├── SkeletonCard/      (NEW)
│   │   └── ProgressiveImage/  (NEW)
│   ├── molecules/
│   │   ├── PageHeader/        (NEW)
│   │   ├── EmptyState/        (NEW)
│   │   ├── Footer/            (NEW)
│   │   └── MobileNav/         (NEW)
│   └── organisms/
│       └── HeroSection/       (NEW)
├── hooks/
│   └── useScrollAnimation.ts  (NEW)
└── utils/
    └── animations.ts          (NEW)
```

---

## DEPENDENCIES TO ADD

```bash
npm install framer-motion canvas-confetti
npm install -D @types/canvas-confetti
# @mantine/hooks should already be installed with @mantine/core
```

---

## QUICK WINS (Do These First - Immediate Impact)

1. **Change primary color** from blue to a vibrant purple: `primaryColor: 'grape'` or custom
2. **Increase card border radius** to `lg` (16px) everywhere
3. **Add hover shadow** to EventCard: `shadow="md"` → hover `shadow="xl"`
4. **Increase image height** in EventCard from 160px to 200px
5. **Add gradient hero** to HomePage
6. **Make navbar sticky** with backdrop blur
7. **Add skeleton screens** instead of spinners
8. **Increase touch targets** to min 44px
9. **Add empty states** instead of "No events found" plain text
10. **Fix mobile padding** to be 20px+ on sides
