const fs = require('fs');
const path = require('path');

const adminCssFiles = [
  // Pages
  'src/frontend/pages/admin/pages/Dashboard.css',
  'src/frontend/pages/admin/pages/Billing.css',
  'src/frontend/pages/admin/pages/Residents.css',
  'src/frontend/pages/admin/pages/Violations.css',
  'src/frontend/pages/admin/pages/Payments.css',
  'src/frontend/pages/admin/pages/Profile.css',
  'src/frontend/pages/admin/pages/Reports.css',
  'src/frontend/pages/admin/pages/AuditLogs.css',
  // Components
  'src/frontend/pages/admin/components/Sidebar.css',
  'src/frontend/pages/admin/components/RegistrationForm.css',
  'src/frontend/pages/admin/components/Dashboard.css'
];

function transformCssContent(content) {
  let transformed = content;

  const className = '[a-zA-Z0-9_-]+';

  // Step 1: Replace sr- prefix with adm-
  transformed = transformed.replace(new RegExp(`\\.sr-(${className})`, 'g'), '.adm-$1');

  // Step 2: Add adm- prefix to any other class that doesn't have it
  transformed = transformed.replace(new RegExp(`([\\s{])\.(?!adm-)(${className})(?=[\\s{.,:>+~[])`, 'g'), '$1.adm-$2');

  // Step 3: Handle compound classes
  transformed = transformed.replace(new RegExp(`([\\s{])\.(?!adm-)(${className})(\\.(${className}))+`, 'g'), (match, before, firstClass, rest) => {
    return before + '.adm-' + firstClass + rest;
  });

  // Step 4: Handle pseudo-classes
  transformed = transformed.replace(new RegExp(`([\\s{])\.(?!adm-)(${className})(:[a-zA-Z-]+)`, 'g'), '$1.adm-$2$3');

  // Step 5: Keyframes
  transformed = transformed.replace(/@keyframes\s+(\w+)/g, (match, name) => {
    return name.startsWith('adm-') ? match : `@keyframes adm-${name}`;
  });

  // Step 6: Animation references
  transformed = transformed.replace(/(animation[^:]*:)\s*(\w+)/g, (match, prefix, name) => {
    return name.startsWith('adm-') ? match : `${prefix} adm-${name}`;
  });

  return transformed;
}

// Process each file
const baseDir = __dirname;
adminCssFiles.forEach(relativePath => {
  const filePath = path.join(baseDir, '..', relativePath);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const transformed = transformCssContent(content);
    fs.writeFileSync(filePath, transformed);
    console.log(`✓ Transformed: ${relativePath}`);
  } else {
    console.log(`✗ Not found: ${relativePath}`);
  }
});

console.log('\nCSS transformation complete!');
