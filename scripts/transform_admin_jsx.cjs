const fs = require('fs');
const path = require('path');

const adminJsxFiles = [
  'src/frontend/pages/admin/Admin.jsx',
  'src/frontend/pages/admin/pages/Dashboard.jsx',
  'src/frontend/pages/admin/pages/Billing.jsx',
  'src/frontend/pages/admin/pages/Residents.jsx',
  'src/frontend/pages/admin/pages/Violations.jsx',
  'src/frontend/pages/admin/pages/Payments.jsx',
  'src/frontend/pages/admin/pages/Profile.jsx',
  'src/frontend/pages/admin/pages/Reports.jsx',
  'src/frontend/pages/admin/pages/AuditLogs.jsx',
  'src/frontend/pages/admin/components/Sidebar.jsx',
  'src/frontend/pages/admin/components/RegistrationForm.jsx'
];

function transformJsxContent(content) {
  let transformed = content;

  // Helper: process a space-separated list of class names
  const processClasses = (classStr) => {
    if (!classStr) return classStr;
    return classStr.split(/\s+/).map(cls => {
      if (!cls || cls.startsWith('${')) return cls; // skip empty or expressions
      // Replace sr- with adm-
      if (cls.startsWith('sr-')) {
        return 'adm-' + cls.substring(3);
      }
      // Add adm- prefix for other generic classes that don't have it
      if (!cls.startsWith('adm-')) {
        return 'adm-' + cls;
      }
      return cls;
    }).join(' ');
  };

  // Pattern 1: className="static classes"
  transformed = transformed.replace(/(className=["'])([^"']+)(["'])/g, (match, before, classStr, after) => {
    const newClasses = processClasses(classStr);
    return before + newClasses + after;
  });

  // Pattern 2: className={\`template\`} - template literals
  transformed = transformed.replace(/(className=\{`)([^`]*)(`\})/g, (match, before, content, after) => {
    // Split by ${...} to preserve expressions
    const parts = content.split(/(\$\{[^}]+\})/);
    const newParts = parts.map(part => {
      if (part.startsWith('${') && part.endsWith('}')) {
        return part; // keep expression as-is
      }
      return processClasses(part);
    });
    return before + newParts.join('') + after;
  });

  // Pattern 3: className={variable} - dynamic, skip (no change needed)

  return transformed;
}

// Process each file
const baseDir = __dirname;
adminJsxFiles.forEach(relativePath => {
  const filePath = path.join(baseDir, '..', relativePath);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const transformed = transformJsxContent(content);
    fs.writeFileSync(filePath, transformed);
    console.log(`✓ Transformed: ${relativePath}`);
  } else {
    console.log(`✗ Not found: ${relativePath}`);
  }
});

console.log('\nJSX transformation complete!');
