// Migrate each MySQL table to separate Firebase collection (1:1 mapping)
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
const fs = require('fs');

// MySQL connection
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project_aunqa'
};

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'aunqa-esar.appspot.com'
  });
}

const db = admin.firestore();

async function migrateExactTables() {
  let connection;
  
  try {
    console.log('🔥 Exact Table Migration - 1:1 MySQL to Firebase');
    console.log('==================================================');
    console.log('🔄 Creating 19 separate collections...\n');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing Firebase data...');
    const collections = await db.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`   Cleared ${snapshot.docs.length} documents from ${collection.id}`);
      }
    }
    console.log('✅ Existing data cleared\n');

    // All 19 tables exactly as they appear in MySQL
    const exactTables = [
      'assessment_sessions',
      'committee_evaluations_ce', 
      'committee_evaluations_ce_ai',
      'evaluations',
      'evaluations_actual_ce',
      'evaluations_actual_ce_ai', 
      'evaluations_ce',
      'evaluations_ce_ai',
      'indicators',
      'indicators_ce',
      'indicators_ce_ai',
      'main_topic',
      'programs',
      'quality_components1',
      'quality_components_ce',
      'quality_components_ce_ai',
      'roles',
      'sub_topic',
      'users'
    ];

    let totalMigrated = 0;
    const migrationResults = [];

    // Migrate each table to its own collection
    for (const tableName of exactTables) {
      try {
        console.log(`📊 Migrating ${tableName} → ${tableName}...`);
        
        const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
        console.log(`   Found ${rows.length} records`);

        if (rows.length === 0) {
          console.log(`   ⚠️  No data to migrate from ${tableName}`);
          
          // Create empty collection with a placeholder document to ensure it exists
          await db.collection(tableName).doc('_placeholder').set({
            _placeholder: true,
            _created_at: admin.firestore.FieldValue.serverTimestamp(),
            _note: 'This collection exists but has no data from MySQL'
          });
          
          migrationResults.push({ table: tableName, count: 0, status: 'empty' });
          console.log(`   📝 Created empty collection: ${tableName}\n`);
          continue;
        }

        // Migrate each row to Firebase
        let migratedCount = 0;
        for (const row of rows) {
          try {
            const docData = {};
            
            // Copy all fields from MySQL row
            Object.keys(row).forEach(key => {
              if (row[key] !== undefined && row[key] !== null) {
                // Handle date fields
                if (key.includes('created_at') || key.includes('updated_at')) {
                  try {
                    docData[key] = admin.firestore.Timestamp.fromDate(new Date(row[key]));
                  } catch {
                    docData[key] = admin.firestore.FieldValue.serverTimestamp();
                  }
                } else {
                  docData[key] = row[key];
                }
              }
            });

            // Add metadata
            docData._migrated_at = admin.firestore.FieldValue.serverTimestamp();
            docData._source_table = tableName;

            // Add created_at if not exists
            if (!docData.created_at) {
              docData.created_at = admin.firestore.FieldValue.serverTimestamp();
            }

            // Add to Firebase collection with same name as MySQL table
            await db.collection(tableName).add(docData);
            migratedCount++;

          } catch (docError) {
            console.log(`     ⚠️  Error migrating document: ${docError.message}`);
          }
        }

        console.log(`   ✅ Migrated ${migratedCount}/${rows.length} records`);
        totalMigrated += migratedCount;
        migrationResults.push({ 
          table: tableName, 
          count: migratedCount, 
          total: rows.length,
          status: 'success' 
        });

      } catch (tableError) {
        console.log(`   ❌ Error migrating ${tableName}: ${tableError.message}`);
        migrationResults.push({ table: tableName, count: 0, status: 'error', error: tableError.message });
      }

      console.log('');
    }

    // Migration summary
    console.log('🎉 Exact Table Migration Summary');
    console.log('================================');
    console.log('┌─────────────────────────────────┬──────────┬─────────┐');
    console.log('│ Collection Name                 │ Records  │ Status  │');
    console.log('├─────────────────────────────────┼──────────┼─────────┤');
    
    migrationResults.forEach(result => {
      const name = result.table.padEnd(31);
      const count = result.count.toString().padStart(8);
      const status = result.status === 'success' ? '✅ OK   ' : 
                    result.status === 'empty' ? '⚠️  Empty' : '❌ Error';
      console.log(`│ ${name} │ ${count} │ ${status} │`);
    });
    
    console.log('└─────────────────────────────────┴──────────┴─────────┘');
    
    console.log(`\n📊 Migration Results:`);
    console.log(`• Total collections created: ${exactTables.length}`);
    console.log(`• Total records migrated: ${totalMigrated.toLocaleString()}`);
    console.log(`• Successful migrations: ${migrationResults.filter(r => r.status === 'success').length}`);
    console.log(`• Empty collections: ${migrationResults.filter(r => r.status === 'empty').length}`);
    console.log(`• Failed migrations: ${migrationResults.filter(r => r.status === 'error').length}`);

    // Files note
    console.log('\n📁 Files:');
    const uploadsDir = './uploads';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`   Found ${files.length} files in uploads folder`);
      console.log('   📝 Files will be migrated to Firebase Storage on-demand');
    }

    console.log('\n🚀 Next Steps:');
    console.log('1. Check Firebase Console - you should see 19 collections');
    console.log('2. Start Firebase server: npm run server-firebase');
    console.log('3. Verify collections: npm run check-firebase');

    await connection.end();
    console.log('\n✅ Exact table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (connection) await connection.end();
  }

  process.exit(0);
}

// Run exact table migration
migrateExactTables();