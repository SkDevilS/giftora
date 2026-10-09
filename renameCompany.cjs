const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '__pycache__') {
                filelist = walkSync(path.join(dir, file), filelist);
            }
        } else {
            const ext = path.extname(file);
            if (['.jsx', '.js', '.html', '.json', '.py', '.txt', '.md'].includes(ext)) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const files = walkSync(process.cwd());
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replacements
    content = content.replace(/GIFTORA VENTURES PRIVATE LIMITED/g, 'GOFTORA TRADING PRIVATE LIMITED');
    content = content.replace(/Giftora Ventures Private Limited/gi, 'Goftora Trading Private Limited');
    content = content.replace(/GIFTORA VENTURES/g, 'GOFTORA TRADING');
    content = content.replace(/Giftora Ventures/g, 'Goftora Trading');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Successfully updated ${modifiedFiles} files.`);
