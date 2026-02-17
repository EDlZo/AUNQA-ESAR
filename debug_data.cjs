
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debugData() {
    const actualSnap = await db.collection('evaluations_actual').limit(1).get();
    if (!actualSnap.empty) {
        console.log('Sample evaluations_actual:', actualSnap.docs[0].data());
    } else {
        console.log('evaluations_actual is empty');
    }
    process.exit(0);
}

debugData();
