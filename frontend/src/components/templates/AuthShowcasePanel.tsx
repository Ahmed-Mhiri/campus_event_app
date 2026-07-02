import { motion } from 'framer-motion';
import { Text, ThemeIcon } from '@mantine/core';
import { IconCalendarEvent, IconUsers, IconMapPin, IconSparkles } from '@tabler/icons-react';

// Mock preview cards — purely decorative, gives the panel a "live campus" feel
const previewEvents = [
  { title: 'AI & Robotics Meetup', location: 'Building C, Room 204', going: 48 },
  { title: 'Fall Career Fair', location: 'Main Auditorium', going: 312 },
  { title: 'Late Night Coding Jam', location: 'Library Basement', going: 26 },
];

const floatUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export function AuthShowcasePanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full h-full overflow-hidden bg-slate-950 px-12 py-14">
      {/* Ambient mesh gradient */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(139,92,246,0.35), transparent 45%), radial-gradient(circle at 85% 30%, rgba(99,102,241,0.25), transparent 50%), radial-gradient(circle at 50% 90%, rgba(168,85,247,0.25), transparent 55%)',
        }}
      />
      {/* Subtle grain */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top: brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <IconSparkles size={18} className="text-violet-300" />
        </div>
        <Text fw={800} size="lg" c="white" style={{ letterSpacing: '-0.02em' }}>
          MyStudy<span className="text-violet-400">App</span>
        </Text>
      </motion.div>

      {/* Middle: headline + floating event cards */}
      <div className="relative z-10 flex flex-col gap-10 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
            Campus life happens here.
          </h2>
          <Text className="text-slate-400 mt-3 text-base leading-relaxed">
            Thousands of students are already finding events, meeting people, and building their
            college story — one RSVP at a time.
          </Text>
        </motion.div>

        <div className="flex flex-col gap-3">
          {previewEvents.map((event, i) => (
            <motion.div
              key={event.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={floatUp}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-4 py-3.5"
            >
              <ThemeIcon size={38} radius="xl" variant="light" color="violet" className="bg-violet-500/20 text-violet-300 shrink-0">
                <IconCalendarEvent size={18} />
              </ThemeIcon>
              <div className="min-w-0 flex-1">
                <Text size="sm" fw={600} c="white" truncate>
                  {event.title}
                </Text>
                <div className="flex items-center gap-1 text-slate-400">
                  <IconMapPin size={11} />
                  <Text size="xs" c="dimmed" truncate>
                    {event.location}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-1 text-violet-300 shrink-0">
                <IconUsers size={13} />
                <Text size="xs" fw={600}>
                  {event.going}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom: social proof strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 flex items-center gap-4 text-slate-400"
      >
        <div className="flex -space-x-2">
          {['#8b5cf6', '#6366f1', '#a855f7', '#7c3aed'].map((c, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-slate-950"
              style={{ background: c }}
            />
          ))}
        </div>
        <Text size="sm">Joined by 12,000+ students this semester</Text>
      </motion.div>
    </div>
  );
}