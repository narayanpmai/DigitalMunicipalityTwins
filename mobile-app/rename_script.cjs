const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function renameKmcToDigi(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
        const files = fs.readdirSync(filePath);
        for (const file of files) {
            renameKmcToDigi(path.join(filePath, file));
        }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(/Kmc/g, 'Digi').replace(/kmc/gi, 'digi');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated content in ${filePath}`);
        }
    }
}

function renameFiles(dirPath) {
    if (fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const oldPath = path.join(dirPath, file);
            let newPath = oldPath;
            if (file.includes('Kmc')) {
                const newName = file.replace(/Kmc/g, 'Digi');
                newPath = path.join(dirPath, newName);
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed ${oldPath} to ${newPath}`);
            } else if (file.includes('kmc')) {
                const newName = file.replace(/kmc/g, 'digi');
                newPath = path.join(dirPath, newName);
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed ${oldPath} to ${newPath}`);
            }
            if (fs.statSync(newPath).isDirectory()) {
                renameFiles(newPath);
            }
        }
    }
}

renameKmcToDigi(srcDir);
renameFiles(srcDir);
