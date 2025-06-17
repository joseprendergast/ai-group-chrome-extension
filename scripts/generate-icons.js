const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [16, 48, 128];
const inputSvg = path.join(__dirname, '..', 'src', 'assets', 'icon.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(inputSvg);
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 