import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Linke-Me | Local Social Network',
        short_name: 'LinkeMe',
        description: 'Connect locally. Grow globally. The social platform for your city.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8FAFC',
        theme_color: '#2563EB',
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
