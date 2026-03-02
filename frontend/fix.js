const fs = require('fs');
function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'http:\/\/\$\{window\.location\.hostname\}:5000(.*?)'/g, "`http://${window.location.hostname}:5000$1`");
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
}
fixFile('src/app/page.tsx');
fixFile('src/app/admin/page.tsx');
