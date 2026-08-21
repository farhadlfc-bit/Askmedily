import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/drug/', '/condition/', '/pricing', '/login'],
      disallow: ['/dashboard', '/settings', '/med-history', '/admin', '/api/'],
    },
    sitemap: 'https://askmedily.com/sitemap.xml',
  };
}
