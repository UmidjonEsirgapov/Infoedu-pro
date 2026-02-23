import Link from 'next/link';
import MyImage from '../MyImage';
import { NC_SITE_SETTINGS } from '@/contains/site-settings';
import { TELEGRAM_LINKS } from '@/contains/buttonTexts';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Asosiy',
    links: [
      { label: 'Bosh sahifa', href: '/' },
      { label: "Oliy ta'lim muassasalari", href: '/oliygoh' },
      { label: 'Darsliklar', href: '/darsliklar' },
      { label: 'Yangiliklar', href: '/posts' },
    ],
  },
  {
    title: 'Foydali',
    links: [
      { label: 'Milliy sertifikat sanalari', href: '/milliy-sertifikat-sanalari' },
      { label: 'Pedagog kadrlar attestatsiyasi', href: '/pedagog-kadrlar-attestatsiyasi' },
      { label: 'Reklama', href: '/reklama' },
    ],
  },
];

const DEFAULT_SOCIALS = [
  { name: 'Telegram', url: TELEGRAM_LINKS.subscribeChannel, icon: '/images/socials/telegram.svg', description: 'Telegram' },
  { name: 'YouTube', url: 'https://youtube.com/@infoeduuz', icon: '/images/socials/youtube.svg', description: 'YouTube' },
];

interface Props {
  menuItems?: any[] | null;
}

export default function Footer({ menuItems }: Props) {
  const currentYear = new Date().getFullYear();
  const copyrightText =
    NC_SITE_SETTINGS?.site_footer?.all_rights_reserved_text ||
    `© ${currentYear} InfoEdu.uz. Barcha huquqlar himoyalangan.`;
  const socials = NC_SITE_SETTINGS?.site_socials?.length
    ? NC_SITE_SETTINGS.site_socials
    : DEFAULT_SOCIALS;

  return (
    <footer
      className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Sayt xaritasi
      </h2>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Logo va tavsif */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">InfoEdu</span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
              O&apos;zbekiston ta&apos;lim yangiliklari, grantlar va universitetlar haqidagi ishonchli manba.
            </p>
            <div className="mt-3 flex items-center gap-3">
              {socials?.map((item: any) => (
                <a
                  key={item?.name}
                  href={item?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  aria-label={item?.name}
                >
                  {item?.icon ? (
                    <MyImage
                      width={20}
                      height={20}
                      className="h-5 w-5 opacity-80 hover:opacity-100"
                      src={item.icon}
                      alt=""
                    />
                  ) : (
                    <span className="text-xs font-medium">{item?.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Sayt bo'yicha linklar */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                {section.title}
              </h3>
              <ul role="list" className="mt-2 space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p
            className="text-center text-xs text-slate-500 dark:text-slate-400"
            dangerouslySetInnerHTML={{ __html: copyrightText }}
          />
        </div>
      </div>
    </footer>
  );
}
