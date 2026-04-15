const fs = require('fs');

// Files to update
const files = ['departmentGoalsData.ts', 'departmentMeetingsData.ts', 'evaluationData.ts'];

files.forEach(filename => {
  try {
    let content = fs.readFileSync(filename, 'utf8');
    
    // 1. Remove Finance sections (they're duplicates of Production)
    content = content.replace(/'Finance':\s*\[[^\]]+\],?\n?/gs, '');
    
    // 2. Rename other departments
    content = content.replace(/'IT':/g, "'Logistics':");
    content = content.replace(/'Sales':/g, "'International Market':");
    content = content.replace(/'Marketing':/g, "'Domestic Market':");
    content = content.replace(/'Legal':/g, "'Quality Control':");
    content = content.replace(/'Customer Service':/g, "'After-Sales':");
    
    // Write back
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`✓ Updated ${filename}`);
  } catch (err) {
    console.log(`✗ Error updating ${filename}: ${err.message}`);
  }
});

console.log('Done!');
