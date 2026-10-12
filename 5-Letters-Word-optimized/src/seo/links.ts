import { Filter, RouteInfo, Tab, filterPath, tabPath, SITE_NAME } from './routes';

const BASE = import.meta.env.BASE_URL || '/';

/** Prefix a route path ("/wordle-solver/") with the deploy base ("/repo"). */
export const withBase = (path: string): string => BASE.replace(/\/$/, '') + path;
export const tabHref = (tab: Tab): string => withBase(tabPath(tab));
export const filterHref = (filter: Filter): string => withBase(filterPath(filter) ?? '/');

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string, content: string) =>
  setTag(
    `meta[${key}="${name}"]`,
    () => {
      const m = document.createElement('meta');
      m.setAttribute(key, name);
      return m;
    },
    'content',
    content,
  );

/** Keep title, description, canonical and social tags in sync when the user navigates inside the app. */
export function applyRouteHead(route: RouteInfo): void {
  const url = window.location.origin + withBase(route.path);
  document.title = route.title;
  meta('name', 'description', route.description);
  meta('property', 'og:title', route.title);
  meta('property', 'og:description', route.description);
  meta('property', 'og:url', url);
  meta('property', 'og:site_name', SITE_NAME);
  meta('name', 'twitter:title', route.title);
  meta('name', 'twitter:description', route.description);
  setTag(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    },
    'href',
    url,
  );
}
