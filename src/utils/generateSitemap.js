// This script generates a sitemap.xml for your website
// Run it with: node src/utils/generateSitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://giftora.com';

// Static pages
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/shipping', priority: '0.7', changefreq: 'monthly' },
  { url: '/refund-policy', priority: '0.7', changefreq: 'monthly' },
  { url: '/terms', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.7', changefreq: 'monthly' },
];

// You'll need to fetch these from your API
// For now, add common categories manually
const categories = [
  'shampoo',
  'moisturizer',
  'perfume',
  'soaps',
  'toothpaste-brush',
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add category pages
  categories.forEach(category => {
    sitemap += `  <url>
    <loc>${BASE_URL}/category/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  // Write to public folder
  const publicPath = path.join(__dirname, '../../public/sitemap.xml');
  fs.writeFileSync(publicPath, sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
