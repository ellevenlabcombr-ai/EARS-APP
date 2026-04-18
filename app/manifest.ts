import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EARS - Clinical Intelligence',
    short_name: 'EARS',
    description: 'Clinical Intelligence for Athletes - Sistema de monitoramento de wellness para atletas da EARS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050B14',
    theme_color: '#050B14',
    orientation: 'portrait',
    icons: [
      {
        src: 'https://picsum.photos/seed/ears/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://picsum.photos/seed/ears/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
