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
        orientation: 'portrait',
        categories: ['social', 'productivity', 'lifestyle'],
        id: '/',
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icon?size=192',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon?size=512',
                sizes: '512x512',
                type: 'image/png',
            }
        ],
        screenshots: [
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/svg+xml',
                // @ts-ignore
                form_factor: 'wide',
                label: 'Linke-Me Desktop'
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/svg+xml',
                label: 'Linke-Me Mobile'
            }
        ]
    };
}
