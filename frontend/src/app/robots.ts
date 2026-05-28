import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ashimarket.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/listing/', '/category/', '/shop/', '/search'],
        disallow: [
          '/dashboard/',
          '/seller/',
          '/admin/',
          '/auth/',
          '/api/',
          '/listing/create',
          '/listing/*/edit',
          '/listing/*/checkout',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard/', '/seller/', '/admin/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
