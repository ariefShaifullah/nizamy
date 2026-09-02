import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const routes = ['faraidh', 'zakat', 'hafalan', 'mushaf', 'hede', 'amal', 'sholat', 'scanner', 'blog'];

let allFixed = true;

for (const route of routes) {
    const file = path.join(DIST_DIR, route, 'index.html');
    if (!fs.existsSync(file)) {
        console.log(`/${route}/ — FILE NOT FOUND`);
        allFixed = false;
        continue;
    }
    const html = fs.readFileSync(file, 'utf-8');
    
    // canonical uses href attribute
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href="([^"]*)"/);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'NOT FOUND';
    
    const ogUrlMatch = html.match(/<meta[^>]*og:url[^>]*content="([^"]*)"/);
    const ogUrl = ogUrlMatch ? ogUrlMatch[1] : 'NOT FOUND';
    
    const ogImageMatch = html.match(/<meta[^>]*og:image[^>]*content="([^"]*)"/);
    const ogImage = ogImageMatch ? ogImageMatch[1] : 'NOT FOUND';
    
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g,'').trim() : 'NOT FOUND';
    
    const issues = [];
    if (canonical === 'NOT FOUND') issues.push('canonical MISSING');
    if (!canonical.includes('/' + route)) issues.push(`canonical should point to /${route} but is: ${canonical}`);
    if (ogImage.includes('og-image.png')) issues.push('og:image still 404 (og-image.png)');
    if (h1 === 'NIZAMY: Aplikasi Islam' || h1 === 'NOT FOUND') issues.push('h1 is generic');
    
    const status = issues.length === 0 ? '✅ FIXED' : `❌ ${issues.join(' | ')}`;
    if (issues.length > 0) allFixed = false;
    
    console.log(`/${route}/ → ${status}`);
    console.log(`  canonical:   ${canonical}`);
    console.log(`  og:url:      ${ogUrl}`);
    console.log(`  og:image:    ${ogImage}`);
    console.log(`  h1:          ${h1}`);
    console.log('');
}

// Homepage check
const homeFile = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(homeFile)) {
    const html = fs.readFileSync(homeFile, 'utf-8');
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href="([^"]*)"/);
    const ogImageMatch = html.match(/<meta[^>]*og:image[^>]*content="([^"]*)"/);
    const ogImage = ogImageMatch ? ogImageMatch[1] : 'NOT FOUND';
    const canonical = canonicalMatch ? canonicalMatch[1] : 'NOT FOUND';
    const issues = [];
    if (canonical !== 'https://nizamy.com/') issues.push('canonical should be https://nizamy.com/');
    if (ogImage.includes('og-image.png')) issues.push('og:image still 404');
    const status = issues.length === 0 ? '✅ FIXED' : `❌ ${issues.join(' | ')}`;
    if (issues.length > 0) allFixed = false;
    console.log(`/ (homepage) → ${status}`);
    console.log(`  canonical:   ${canonical}`);
    console.log(`  og:image:    ${ogImage}`);
}

console.log(allFixed ? '\n🎉 ALL SEO FIXES VERIFIED!' : '\n⚠️ Some fixes still needed.');
