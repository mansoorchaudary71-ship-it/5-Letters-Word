import { WaveDivider } from './ui/WaveDivider';
import React from 'react';
import { ActiveTab } from './Header';
import { filterHref, tabHref, withBase } from '../seo/links';
import { SITE_CONTACT_EMAIL } from '../seo/site';
import { resolveRoute } from '../seo/routes';

const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onNavigateToFinderWithFilter: (filter: { startsWith?: string; endsWith?: string; tag?: string }) => void;
  onNavigate: (path: string) => void;
}

const INFO_LINKS = [
  { label: 'Wordle Strategy Guide', path: '/guides/wordle-strategy/' },
  { label: 'Scrabble 5-Letter Word Guide', path: '/guides/scrabble-five-letter-words/' },
  { label: 'Find a Word From Letters', path: '/guides/find-a-word-from-letters/' },
  { label: 'About', path: '/about/' },
  { label: 'Contact', path: '/contact/' },
  { label: 'Privacy Policy', path: '/privacy-policy/' },
  { label: 'Terms of Use', path: '/terms/' },
  { label: 'Sitemap', path: '/sitemap/' },
].filter((l) => resolveRoute(l.path) !== null);

const COLLECTIONS: { tag: string; label: string }[] = [
  { tag: 'wordle-top', label: 'Best Wordle Opening Words' },
  { tag: 'palindrome', label: '5-Letter Palindromes' },
  { tag: 'no-vowels', label: 'Words with No Vowels' },
  { tag: 'double-letters', label: 'Words with Double Letters' },
  { tag: 'high-scoring', label: 'High Scrabble Point Words' },
];

const linkClass = 'text-slate-500 hover:text-ink transition-colors';
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xs font-semibold text-ink mb-4">{children}</h2>
);

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onNavigateToFinderWithFilter, onNavigate }) => {
  const toolLinks: { tab: ActiveTab; label: string }[] = [
    { tab: 'finder', label: 'Word Finder' },
    { tab: 'solver', label: 'Wordle Solver' },
    { tab: 'anagram', label: 'Anagram Solver' },
    { tab: 'game', label: 'Practice Game' },
    { tab: 'stats', label: 'Letter Frequency' },
    { tab: 'browse', label: 'A–Z Directory' },
  ];

  return (
    <footer className="relative mt-20 sm:mt-28 bg-white text-sm">
      {/* Curved top edge: slate-50 page into the white footer */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-full -mb-px">
        <WaveDivider className="text-white" variant="layered" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 max-w-xs">
            <a
              href={tabHref('finder')}
              onClick={(e) => handleNav(e, () => setActiveTab('finder'))}
              className="inline-flex items-center gap-2.5"
              aria-label="5-Letter Words home"
            >
              <span aria-hidden="true" className="grid grid-cols-5 gap-[2px] p-[3px] rounded-lg bg-brand">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={`w-[5px] h-[14px] rounded-[1.5px] ${i === 1 ? 'bg-hit' : i === 3 ? 'bg-near' : 'bg-white/90'}`} />
                ))}
              </span>
              <span className="font-semibold tracking-tight text-ink">5-Letter Words</span>
            </a>
            <p className="mt-4 text-slate-500 leading-relaxed">
              A free reference for Wordle, Scrabble, crosswords and vocabulary. Find, solve and learn five-letter words.
            </p>
            {SITE_CONTACT_EMAIL && (
              <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="mt-4 inline-block text-slate-500 hover:text-ink transition-colors">
                {SITE_CONTACT_EMAIL}
              </a>
            )}
          </div>

          <nav aria-label="Tools" className="md:col-span-2">
            <Heading>Tools</Heading>
            <ul className="space-y-2.5">
              {toolLinks.map((t) => (
                <li key={t.tab}>
                  <a href={tabHref(t.tab)} onClick={(e) => handleNav(e, () => setActiveTab(t.tab))} className={linkClass}>
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Browse by letter" className="md:col-span-2">
            <Heading>Start with</Heading>
            <ul className="space-y-2.5">
              {['S', 'C', 'B', 'T', 'P', 'M', 'R'].map((letter) => (
                <li key={letter}>
                  <a
                    href={filterHref({ startsWith: letter })}
                    onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ startsWith: letter }))}
                    className={linkClass}
                  >
                    Words starting with {letter}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Browse by ending" className="md:col-span-2">
            <Heading>End with</Heading>
            <ul className="space-y-2.5">
              {['E', 'Y', 'S', 'T', 'D', 'R', 'N'].map((letter) => (
                <li key={letter}>
                  <a
                    href={filterHref({ endsWith: letter })}
                    onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ endsWith: letter }))}
                    className={linkClass}
                  >
                    Words ending with {letter}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Curated lists" className="col-span-2 md:col-span-2">
            <Heading>Collections</Heading>
            <ul className="space-y-2.5">
              {COLLECTIONS.map((c) => (
                <li key={c.tag}>
                  <a
                    href={filterHref({ tag: c.tag })}
                    onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: c.tag }))}
                    className={linkClass}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav aria-label="Guides and information" className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="sr-only">Guides and information</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
            {INFO_LINKS.map((l) => (
              <li key={l.path}>
                <a href={withBase(l.path)} onClick={(e) => handleNav(e, () => onNavigate(l.path))} className={linkClass}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-xs text-slate-400 leading-relaxed">
          <p>© {new Date().getFullYear()} 5-Letter Words. All rights reserved.</p>
          <p className="max-w-2xl md:text-right">
            Wordle is a trademark of The New York Times Company. Scrabble is a trademark of Hasbro and Mattel. This independent
            educational tool is not affiliated with or endorsed by any trademark holder.
          </p>
        </div>
      </div>
    </footer>
  );
};
