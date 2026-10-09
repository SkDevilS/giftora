const fs = require('fs');
const path = require('path');

const newAddressStr1 = 'PLOT NO E-260 B-A, Balongi, Rupnagar';
const newAddressStr2 = 'SECTOR-74, PH-8B, INDL AREA';
const newAddressStr3 = 'Mohali District: SAS Nagar State: Punjab 160055';
const newFullAddress = `${newAddressStr1}, ${newAddressStr2}, ${newAddressStr3}, India`;

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // StaticPage constants
    content = content.replace(/const ADDRESS_LINE1 = 'FOURTH FLOOR Building No\.\/Flat No\.: UNIT NO OF-437, TOWER A2';/, `const ADDRESS_LINE1 = '${newAddressStr1}';`);
    content = content.replace(/const ADDRESS_LINE2 = 'Spaze I Tech Park, SOHNA ROAD, Sector 49';/, `const ADDRESS_LINE2 = '${newAddressStr2}';`);
    content = content.replace(/const ADDRESS_LINE3 = 'Gurugram District: Gurugram State: Haryana 122018';/, `const ADDRESS_LINE3 = '${newAddressStr3}';`);
    
    // In-text Gurugram replacements
    content = content.replace(/Based in Gurugram, Haryana/g, 'Based in Mohali, Punjab');
    content = content.replace(/presence in Gurugram/g, 'presence in Mohali');
    content = content.replace(/jurisdiction of the courts in Gurugram, Haryana/g, 'jurisdiction of the courts in Mohali, Punjab');
    
    // Address replacement in StaticPage
    content = content.replace(/FOURTH FLOOR Building No\.\/Flat No\.: UNIT NO OF-437, TOWER A2, Spaze I Tech Park, SOHNA ROAD, Sector 49, Gurugram District: Gurugram State: Haryana 122018/g, `${newAddressStr1}, ${newAddressStr2}, ${newAddressStr3}`);
    
    // Footer and Privacy Page
    content = content.replace(/FOURTH FLOOR Building No\.\/Flat No\.: UNIT NO OF-437, TOWER A2<br \/>/g, `${newAddressStr1}<br />`);
    content = content.replace(/Spaze I Tech Park, SOHNA ROAD, Sector 49<br \/>/g, `${newAddressStr2}<br />`);
    content = content.replace(/Gurugram District: Gurugram State: Haryana 122018<br \/>/g, `${newAddressStr3}<br />`);
    content = content.replace(/<p>Gurugram District: Gurugram State: Haryana 122018<\/p>/g, `<p>${newAddressStr3}</p>`);
    content = content.replace(/<p>FOURTH FLOOR Building No\.\/Flat No\.: UNIT NO OF-437, TOWER A2<\/p>/g, `<p>${newAddressStr1}</p>`);
    content = content.replace(/<p>Spaze I Tech Park, SOHNA ROAD, Sector 49<\/p>/g, `<p>${newAddressStr2}</p>`);

    // SEO
    content = content.replace(/Based in Gurugram, Haryana/g, 'Based in Mohali, Punjab');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const filesToUpdate = [
    'src/pages/StaticPage.jsx',
    'src/pages/PrivacyPage.jsx',
    'src/components/Footer.jsx',
    'src/components/SEO.jsx'
];

filesToUpdate.forEach(file => {
    replaceInFile(path.join(process.cwd(), file));
});
