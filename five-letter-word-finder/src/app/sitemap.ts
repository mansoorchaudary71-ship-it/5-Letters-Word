import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/word-finder/'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }))
}
