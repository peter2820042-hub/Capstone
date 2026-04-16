const fs = require('fs');
const path = require('path');

const adminPagesDir = 'Sentrina/src/frontend/pages/admin/pages';
const staffPagesDir = 'Sentrina/src/frontend/pages/staff/pages';
const userPagesDir = 'Sentrina/src/frontend/pages/user/pages';

const replacements = {
  // Modal classes
  'modal-overlay': 'admin-modal-overlay',
  'modal ': 'admin-modal ',
  'modal-header': 'admin-modal-header',
  'modal-close': 'admin-modal-close',
  'modal-body': 'admin-modal-body',
  'modal-footer': 'admin-modal-footer',
  'modal-content': 'admin-modal-content',
  'modal-actions': 'admin-modal-actions',
  'modal-form': 'admin-modal-form',
  
  // Button classes
  'btn-primary': 'admin-btn-primary',
  'btn-secondary': 'admin-btn-secondary',
  'btn-danger': 'admin-btn-danger',
  'btn-success': 'admin-btn-success',
  'btn-cancel': 'admin-btn-cancel',
  
  // Form classes
  'form-group': 'admin-form-group',
  'form-row': 'admin-form-row',
  'form-grid': 'admin-form-grid',
  'form-item': 'admin-form-item',
  'form-message': 'admin-form-message',
  'form-actions': 'admin-form-actions',
  
  // Table classes
  'table-container': 'admin-table-container',
  'table-header': 'admin-table-header',
  'table-title': 'admin-table-title',
  'table-info': 'admin-table-info',
  'table-actions': 'admin-table-actions',
  'empty-row': 'admin-empty-row',
  
  // Stats classes
  'stats-section': 'admin-stats-section',
  'stats-grid': 'admin-stats-grid',
  'stat-card': 'admin-stat-card',
  'stat-icon': 'admin-stat-icon',
  'stat-content': 'admin-stat-content',
  'stat-label': 'admin-stat-label',
  'stat-value': 'admin-stat-value',
  
  // Filter classes
  'search-filter-bar': 'admin-search-filter-bar',
  'filter-group': 'admin-filter-group',
  'search-btn': 'admin-search-btn',
  'clear-btn': 'admin-clear-btn',
  
  // Pagination classes
  'pagination': 'admin-pagination',
  'pagination-btn': 'admin-pagination-btn',
  'pagination-info': 'admin-pagination-info',
  
  // Detail classes
  'detail-row': 'admin-detail-row',
  'detail-card': 'admin-detail-card',
  
  // KPI classes (Dashboard)
  'kpi-card': 'admin-kpi-card',
  'kpi-grid': 'admin-kpi-grid',
  'kpi-icon': 'admin-kpi-icon',
  'kpi-content': 'admin-kpi-content',
  'kpi-value': 'admin-kpi-value',
  'kpi-label': 'admin-kpi-label',
  'charts-section': 'admin-charts-section',
  'chart-card': 'admin-chart-card',
};

const staffReplacements = {
  ...replacements,
  // Override prefix for staff pages
  'modal-overlay': 'staff-modal-overlay',
  'modal ': 'staff-modal ',
  'modal-header': 'staff-modal-header',
  'modal-close': 'staff-modal-close',
  'modal-body': 'staff-modal-body',
  'modal-footer': 'staff-modal-footer',
  'modal-content': 'staff-modal-content',
  'modal-actions': 'staff-modal-actions',
  'modal-form': 'staff-modal-form',
  'btn-primary': 'staff-btn-primary',
  'btn-secondary': 'staff-btn-secondary',
  'btn-danger': 'staff-btn-danger',
  'btn-success': 'staff-btn-success',
  'btn-cancel': 'staff-btn-cancel',
  'form-group': 'staff-form-group',
  'form-row': 'staff-form-row',
  'form-grid': 'staff-form-grid',
  'form-item': 'staff-form-item',
  'form-message': 'staff-form-message',
  'form-actions': 'staff-form-actions',
  'table-container': 'staff-table-container',
  'table-header': 'staff-table-header',
  'table-title': 'staff-table-title',
  'table-info': 'staff-table-info',
  'table-actions': 'staff-table-actions',
  'empty-row': 'staff-empty-row',
  'stats-section': 'staff-stats-section',
  'stats-grid': 'staff-stats-grid',
  'stat-card': 'staff-stat-card',
  'stat-icon': 'staff-stat-icon',
  'stat-content': 'staff-stat-content',
  'stat-label': 'staff-stat-label',
  'stat-value': 'staff-stat-value',
  'search-filter-bar': 'staff-search-filter-bar',
  'filter-group': 'staff-filter-group',
  'search-btn': 'staff-search-btn',
  'clear-btn': 'staff-clear-btn',
  'pagination': 'staff-pagination',
  'pagination-btn': 'staff-pagination-btn',
  'pagination-info': 'staff-pagination-info',
  'detail-row': 'staff-detail-row',
  'detail-card': 'staff-detail-card',
};

const userReplacements = {
  ...replacements,
  // Override prefix for user pages
  'modal-overlay': 'user-modal-overlay',
  'modal ': 'user-modal ',
  'modal-header': 'user-modal-header',
  'modal-close': 'user-modal-close',
  'modal-body': 'user-modal-body',
  'modal-footer': 'user-modal-footer',
  'modal-content': 'user-modal-content',
  'modal-actions': 'user-modal-actions',
  'modal-form': 'user-modal-form',
  'btn-primary': 'user-btn-primary',
  'btn-secondary': 'user-btn-secondary',
  'btn-danger': 'user-btn-danger',
  'btn-success': 'user-btn-success',
  'btn-cancel': 'user-btn-cancel',
  'form-group': 'user-form-group',
  'form-row': 'user-form-row',
  'form-grid': 'user-form-grid',
  'form-item': 'user-form-item',
  'form-message': 'user-form-message',
  'form-actions': 'user-form-actions',
  'table-container': 'user-table-container',
  'table-header': 'user-table-header',
  'table-title': 'user-table-title',
  'table-info': 'user-table-info',
  'table-actions': 'user-table-actions',
  'empty-row': 'user-empty-row',
  'stats-section': 'user-stats-section',
  'stats-grid': 'user-stats-grid',
  'stat-card': 'user-stat-card',
  'stat-icon': 'user-stat-icon',
  'stat-content': 'user-stat-content',
  'stat-label': 'user-stat-label',
  'stat-value': 'user-stat-value',
  'search-filter-bar': 'user-search-filter-bar',
  'filter-group': 'user-filter-group',
  'search-btn': 'user-search-btn',
  'clear-btn': 'user-clear-btn',
  'pagination': 'user-pagination',
  'pagination-btn': 'user-pagination-btn',
  'pagination-info': 'user-pagination-info',
  'detail-row': 'user-detail-row',
  'detail-card': 'user-detail-card',
};

function processFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Apply replacements
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

// Admin pages
const adminPages = ['Billing', 'Payments', 'Violations', 'Residents', 'AuditLogs', 'Reports', 'Notification', 'Profile', 'Dashboard'];
console.log('\n--- Processing Admin CSS Files ---');
adminPages.forEach(page => {
  const cssFile = path.join(adminPagesDir, `${page}.css`);
  if (fs.existsSync(cssFile)) {
    processFile(cssFile, replacements);
  }
});

console.log('\n--- Processing Admin JSX Files ---');
adminPages.forEach(page => {
  const jsxFile = path.join(adminPagesDir, `${page}.jsx`);
  if (fs.existsSync(jsxFile)) {
    processFile(jsxFile, replacements);
  }
});

// Staff pages
const staffPages = ['Billing', 'Payment', 'Violations', 'Residents', 'Reports', 'Notification', 'Profile', 'Dashboard'];
console.log('\n--- Processing Staff CSS Files ---');
staffPages.forEach(page => {
  const cssFile = path.join(staffPagesDir, `${page}.css`);
  if (fs.existsSync(cssFile)) {
    processFile(cssFile, staffReplacements);
  }
});

console.log('\n--- Processing Staff JSX Files ---');
staffPages.forEach(page => {
  const jsxFile = path.join(staffPagesDir, `${page}.jsx`);
  if (fs.existsSync(jsxFile)) {
    processFile(jsxFile, staffReplacements);
  }
});

// User pages
const userPages = ['Billing', 'Payment', 'Violation', 'Profile', 'Notification', 'Dashboard'];
console.log('\n--- Processing User CSS Files ---');
userPages.forEach(page => {
  const cssFile = path.join(userPagesDir, `${page}.css`);
  if (fs.existsSync(cssFile)) {
    processFile(cssFile, userReplacements);
  }
});

console.log('\n--- Processing User JSX Files ---');
userPages.forEach(page => {
  const jsxFile = path.join(userPagesDir, `${page}.jsx`);
  if (fs.existsSync(jsxFile)) {
    processFile(jsxFile, userReplacements);
  }
});

console.log('\nDone! All page classes have been prefixed.');