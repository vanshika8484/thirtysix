const fs = require('fs');
const path = require('path');

function findDuplicatesInFile(targetPath) {
  const absolutePath = path.resolve(targetPath);
  const source = fs.readFileSync(absolutePath, 'utf8');

  // Extract all http/https URLs. Avoid quotes, commas, brackets, whitespace.
  const urlRegex = /https?:\/\/[^\s"'\],>]+/g;
  const urls = source.match(urlRegex) || [];

  const counts = new Map();
  for (const url of urls) {
    counts.set(url, (counts.get(url) || 0) + 1);
  }

  const duplicates = [];
  for (const [url, count] of counts.entries()) {
    if (count > 1) duplicates.push([url, count]);
  }

  duplicates.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return {
    totalUrls: urls.length,
    uniqueUrls: counts.size,
    duplicateCount: duplicates.length,
    duplicates,
  };
}

function main() {
  const target = process.argv[2] || 'thirtsix/src/canvasImages.js';
  const result = findDuplicatesInFile(target);
  console.log(JSON.stringify(result, null, 2));
}

main();


