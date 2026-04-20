const fs = require('fs');
const cp = require('child_process');

// Find all React component files
const paths = cp.execSync('find components app -name "*.tsx"')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

const textMap = {
  'text-[6px]': 'text-xxs',
  'text-[7px]': 'text-xxs',
  'text-[8px]': 'text-xxs',
  'text-[9px]': 'text-xxs',
  'text-[10px]': 'text-xxs',
  'text-[11px]': 'text-xs',
  'text-[12px]': 'text-xs',
  'text-[14px]': 'text-sm',
  'text-[16px]': 'text-base',
  'text-[18px]': 'text-lg',
  'text-[20px]': 'text-xl',
  'text-[24px]': 'text-2xl',
  'text-[28px]': 'text-3xl',
  'text-[32px]': 'text-4xl'
};

let changedFiles = 0;

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  let originalContent = content;

  // 1. Replace specific text classes
  for (const [pxClass, relClass] of Object.entries(textMap)) {
    content = content.split(pxClass).join(relClass);
  }

  // 2. Replace other arbitrary pixel values with rem (e.g. min-w-[200px] -> min-w-[12.5rem])
  // We'll skip 1px, 2px since those are usually borders/lines
  content = content.replace(/(?<!-)(w|h|min-w|min-h|max-w|max-h|gap|top|bottom|left|right|rounded|p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|blur)-\[([0-9]+)px\]/g, (match, prop, pxValue) => {
    const px = parseInt(pxValue, 10);
    if (px <= 2 && prop !== 'rounded') {
      return match; // Keep small borders as px
    }
    const rem = px / 16;
    // Format to avoid long decimals
    const remString = Number(rem.toFixed(4)).toString() + 'rem';
    return `${prop}-[${remString}]`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(p, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${p}`);
  }
}

console.log(`Refactored ${changedFiles} files with responsive units.`);
