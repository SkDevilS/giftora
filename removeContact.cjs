const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace the email and phone text with empty string, but keep the structural elements if necessary, 
    // or just remove the value so it looks blank.
    // For StaticPage and PrivacyPage, removing the email string will just leave it blank.
    
    // In StaticPage.jsx
    content = content.replace(/const EMAIL = 'giftora68@gmail\.com';/, "const EMAIL = '';");
    
    // Global replacement for email
    content = content.replace(/giftora68@gmail\.com/g, '');
    
    // Global replacement for phone number
    content = content.replace(/\+91 8745015901/g, '');
    content = content.replace(/8745015901/g, ''); // For tel: links

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const filesToUpdate = [
    'src/pages/StaticPage.jsx',
    'src/pages/PrivacyPage.jsx',
    'src/components/Footer.jsx'
];

filesToUpdate.forEach(file => {
    replaceInFile(path.join(process.cwd(), file));
});
