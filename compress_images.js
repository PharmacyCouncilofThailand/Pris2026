const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, 'public', 'assets', 'Img');

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function compressImages() {
  console.log('Scanning for images in:', targetDir);
  const files = getAllFiles(targetDir);
  
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  console.log(`Found ${imageFiles.length} image files to check.`);

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let processCount = 0;

  for (const file of imageFiles) {
    try {
      const stats = fs.statSync(file);
      const originalSize = stats.size;
      
      // Only compress if file is larger than 1MB (1,000,000 bytes)
      if (originalSize > 500000) {
        processCount++;
        totalOriginalSize += originalSize;
        
        const ext = path.extname(file).toLowerCase();
        const tempFile = file + '.tmp' + ext;
        
        console.log(`Compressing: ${path.basename(file)} (${(originalSize/1024/1024).toFixed(2)} MB)`);
        
        // Get image metadata to check dimensions
        const metadata = await sharp(file).metadata();
        const resizeOptions = metadata.width > 1920 ? { width: 1920, withoutEnlargement: true } : {};
        
        if (ext === '.jpg' || ext === '.jpeg') {
          await sharp(file)
            .resize(resizeOptions)
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(tempFile);
        } else if (ext === '.png') {
          await sharp(file)
            .resize(resizeOptions)
            .png({ quality: 80, compressionLevel: 8 })
            .toFile(tempFile);
        }

        const newStats = fs.statSync(tempFile);
        totalNewSize += newStats.size;
        
        // Replace original with compressed
        fs.unlinkSync(file);
        fs.renameSync(tempFile, file);
        
        console.log(`  -> New size: ${(newStats.size/1024/1024).toFixed(2)} MB`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  console.log('\n--- Compression Summary ---');
  console.log(`Processed ${processCount} images.`);
  console.log(`Original size: ${(totalOriginalSize/1024/1024).toFixed(2)} MB`);
  console.log(`New size: ${(totalNewSize/1024/1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOriginalSize - totalNewSize)/1024/1024).toFixed(2)} MB`);
}

compressImages().catch(console.error);
