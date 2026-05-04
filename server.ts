import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Dynamic Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || 'growplex.sbs';
    const baseUrl = `${protocol}://${host}`;

    const urls = [
      '/',
      '/services',
      '/pricing',
      '/faq',
      '/how-it-works',
      '/support',
      '/blog',
      '/blog/grow-instagram-without-password',
      '/blog/cheapest-smm-panel-safe',
      '/blog/what-is-smm-panel-no-login',
      '/blog/top-10-social-media-services-2026',
      '/blog/growplex-vs-competitors',
      '/about',
      '/contact',
      '/privacy-policy',
      '/terms-of-service',
      '/refund-policy'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach(urlPath => {
      // Basic priority/changefreq logic
      let priority = '0.6';
      let changefreq = 'monthly';
      
      if (urlPath === '/') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (urlPath === '/services' || urlPath === '/blog') {
        priority = '0.9';
        changefreq = 'daily';
      } else if (urlPath === '/pricing' || urlPath === '/faq') {
        priority = '0.8';
        changefreq = 'weekly';
      } else if (urlPath.startsWith('/blog/')) {
        priority = '0.7';
        changefreq = 'monthly';
      }

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${urlPath}</loc>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || 'growplex.sbs';
    const baseUrl = `${protocol}://${host}`;
    
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/\nDisallow: /success\nDisallow: /failed\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Check if dist exists, else it might be build time
    const distPath = path.join(process.cwd(), 'dist');
    // Ensure static files are served correctly without index fallback for missing assets
    app.use(express.static(distPath, {
      index: false,
    }));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
