// Update all API URLs from port 3001 to 3002 (Firebase)
const fs = require('fs');
const path = require('path');

function updateApiUrls() {
  console.log('🔄 Updating ALL API URLs from port 3001 to 3002...\n');

  // Files to update - รวมไฟล์ที่เหลือทั้งหมด
  const filesToUpdate = [
    'src/components/LoginModal.jsx',
    'src/components/IndicatorTable.jsx',
    'src/components/DashboardContent.jsx',
    'src/components/AssessmentTable.jsx',
    'src/components/AssessmentForm.jsx',
    'src/components/AssessmentFormModal.jsx',
    'src/components/EvaluationFormModal.jsx',
    'src/components/FileViewer.jsx',
    'src/components/IndicatorDetail.jsx',
    'src/components/Quality/AddQualityForm.jsx',
    'src/components/Quality/DefineComponentSection.jsx',
    'src/pages/AssessmentPage.jsx',
    'src/pages/AssessmentTablePage.jsx',
    'src/pages/CommitteeEvaluationPage.jsx',
    'src/pages/SummaryPage.jsx',
    'src/pages/ReportsPage.jsx'
  ];

  let totalUpdates = 0;

  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`📝 Updating ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace all instances of localhost:3001 with localhost:3002
      content = content.replace(/http:\/\/localhost:3001/g, 'http://localhost:3002');
      
      // Also replace any hardcoded API paths that might be wrong
      content = content.replace(/\/api\/quality-components1/g, '/api/quality-components');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        const matches = (originalContent.match(/http:\/\/localhost:3001/g) || []).length;
        console.log(`   ✅ Updated ${matches} API URLs`);
        totalUpdates += matches;
      } else {
        console.log(`   ⚠️  No URLs to update`);
      }
    } else {
      console.log(`   ❌ File not found: ${filePath}`);
    }
  });

  console.log(`\n🎉 Update completed!`);
  console.log(`📊 Total API URLs updated: ${totalUpdates}`);
  console.log(`🔥 All APIs now point to Firebase server (port 3002)`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Make sure Firebase server is running: npm run server-firebase');
  console.log('2. Refresh your browser (F5)');
  console.log('3. Try using the system again');
}

updateApiUrls();