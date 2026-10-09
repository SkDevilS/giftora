const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace shopzen variants
    content = content.replace(/shopzenventures\.shop/gi, 'giftora.com');
    content = content.replace(/shopzenventures\.com/gi, 'giftora.com');
    content = content.replace(/shopzen/g, 'giftora');
    content = content.replace(/ShopZen/g, 'Giftora');
    content = content.replace(/Shopzen/g, 'Giftora');
    content = content.replace(/SHOPZEN/g, 'GIFTORA');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.idea' && file !== '.vscode') {
                walk(filePath);
            }
        } else {
            if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
                replaceInFile(filePath);
            }
        }
    });
}

walk(process.cwd());
