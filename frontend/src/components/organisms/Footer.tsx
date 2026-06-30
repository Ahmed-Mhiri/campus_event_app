import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { IconSchool } from '@tabler/icons-react';

const footerLinks = {
  Product: [
    { label: 'Browse Events', href: ROUTES.EVENTS },
    { label: 'Create Event', href: ROUTES.CREATE_EVENT },
    { label: 'My Events', href: ROUTES.MY_EVENTS },
  ],
  Account: [
    { label: 'Profile', href: ROUTES.PROFILE },
    { label: 'Registrations', href: ROUTES.MY_REGISTRATIONS },
    { label: 'Preferences', href: ROUTES.PREFERENCES },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Report Issue', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4" aria-label="Home">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <IconSchool className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                MyStudy<span className="text-brand-600">App</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Discover and join amazing events at your university. Connect with students and make the most of campus life.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} MyStudyApp. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}