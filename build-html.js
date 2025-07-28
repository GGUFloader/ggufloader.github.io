const fs = require('fs');
const path = require('path');

function buildHTML() {
    console.log('Building modular HTML file...');

    // Read the template file
    let htmlContent = fs.readFileSync('index-new.html', 'utf8');

    // Define include files and their paths
    const includes = [
        { placeholder: '<!-- INCLUDE: includes/head-meta.html -->', file: 'includes/head-meta.html' },
        { placeholder: '<!-- INCLUDE: includes/head-styles.html -->', file: 'includes/head-styles.html' },
        { placeholder: '<!-- INCLUDE: includes/head-scripts-simple.html -->', file: 'includes/head-scripts-simple.html' },
        { placeholder: '<!-- INCLUDE: includes/navigation.html -->', file: 'includes/navigation.html' },
        { placeholder: '<!-- INCLUDE: includes/hero-section.html -->', file: 'includes/hero-section.html' },
        { placeholder: '<!-- INCLUDE: includes/features-section.html -->', file: 'includes/features-section.html' },
        { placeholder: '<!-- INCLUDE: includes/scripts-section.html -->', file: 'includes/scripts-section.html' }
    ];

    // Replace each include placeholder with the actual file content
    includes.forEach(include => {
        try {
            const includeContent = fs.readFileSync(include.file, 'utf8');
            htmlContent = htmlContent.replace(include.placeholder, includeContent);
            console.log(`✓ Included ${include.file}`);
        } catch (error) {
            console.error(`✗ Error including ${include.file}:`, error.message);
        }
    });

    // Write the final HTML file
    fs.writeFileSync('index-modular.html', htmlContent);
    console.log('✓ Built index-modular.html successfully!');

    // Check file sizes
    const originalSize = fs.statSync('index.html').size;
    const newSize = fs.statSync('index-modular.html').size;

    console.log(`\nFile size comparison:`);
    console.log(`Original index.html: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`New index-modular.html: ${(newSize / 1024).toFixed(2)} KB`);

    // Count lines in each file
    const originalLines = fs.readFileSync('index.html', 'utf8').split('\n').length;
    const newLines = fs.readFileSync('index-modular.html', 'utf8').split('\n').length;

    console.log(`\nLine count comparison:`);
    console.log(`Original index.html: ${originalLines} lines`);
    console.log(`New index-modular.html: ${newLines} lines`);

    // Show component file sizes
    console.log(`\nComponent file sizes:`);
    includes.forEach(include => {
        try {
            const size = fs.statSync(include.file).size;
            const lines = fs.readFileSync(include.file, 'utf8').split('\n').length;
            console.log(`${include.file}: ${lines} lines (${(size / 1024).toFixed(2)} KB)`);
        } catch (error) {
            console.log(`${include.file}: Error reading file`);
        }
    });
}

// Run the build
buildHTML();