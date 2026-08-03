import { MetadataRoute } from 'next';
import { SERVER_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/user',
        '/order',
        '/payment-method',
        '/place-order',
        '/shipping-address',
        '/api',
      ],
    },
    sitemap: `${SERVER_URL}/sitemap.xml`,
  };
}
