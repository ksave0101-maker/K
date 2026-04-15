const fs = require('fs');

// Department name mapping
const deptMapping = {
  'Finance': 'Production',
  'IT': 'Logistics',
  'Sales': 'International Market',
  'Marketing': 'Domestic Market',
  'Legal': 'Quality Control',
  'Customer Service': 'After-Sales'
};

// Files to update
const files = ['departmentGoalsData.ts', 'departmentMeetingsData.ts', 'evaluationData.ts'];

files.forEach(filename => {
  try {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace old department names with new ones
    Object.entries(deptMapping).forEach(([oldName, newName]) => {
      const regex = new RegExp(`'${oldName}'`, 'g');
      content = content.replace(regex, `'${newName}'`);
    });
    
    //Write back
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`✓ Updated ${filename}`);
  } catch (err) {
    console.log(`✗ Error updating ${filename}: ${err.message}`);
  }
});

console.log('Done!');
