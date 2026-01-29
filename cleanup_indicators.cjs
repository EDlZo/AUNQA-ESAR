const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
            console.log('✅ Firebase Admin initialized');
        } else {
            console.error('❌ Missing Firebase environment variables');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

// Helper to pad sequence like "1" to "01" or "1.1" to "01.01"
const normalizeSequence = (seq) => {
    if (!seq) return '';
    return String(seq).split('.')
        .map(part => {
            const p = part.trim();
            return p.length === 1 ? '0' + p : p;
        })
        .join('.');
};

async function aggressiveCleanup(majorName) {
    console.log(`🧹 Starting aggressive cleanup for major: ${majorName}`);

    const snapshot = await db.collection('indicators')
        .where('major_name', '==', majorName)
        .get();

    if (snapshot.empty) {
        console.log('No indicators found for this major.');
        return;
    }

    // IMPORTANT: use Firestore doc.id explicitly to avoid collision with data.id
    const indicators = snapshot.docs.map(doc => ({ _firestoreDocId: doc.id, ...doc.data() }));

    // Sort oldest first
    indicators.sort((a, b) => {
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        return timeA - timeB;
    });

    const seenFullKey = new Set();
    const toDelete = new Set();
    const toUpdate = [];

    for (const ind of indicators) {
        const originalSeq = String(ind.sequence || '').trim();
        const normSeq = normalizeSequence(originalSeq);
        const nameKey = String(ind.indicator_name || ind.indicatorName || '').trim().toLowerCase();
        const compId = String(ind.component_id || '');

        const fullKey = `${compId}_${normSeq}_${nameKey}`;

        if (originalSeq !== normSeq) {
            console.log(`- Queueing normalization: [${originalSeq}] -> [${normSeq}] ID: ${ind._firestoreDocId}`);
            toUpdate.push({ docId: ind._firestoreDocId, normalizedSeq: normSeq });
            ind.sequence = normSeq;
        }

        if (nameKey !== '' && seenFullKey.has(fullKey)) {
            console.log(`- Duplicate found (will delete): [${normSeq}] ${ind.indicator_name} ID: ${ind._firestoreDocId}`);
            toDelete.add(ind._firestoreDocId);
        } else if (nameKey !== '') {
            seenFullKey.add(fullKey);
        }
    }

    console.log(`🔍 Stats: ${indicators.length} total, ${toUpdate.length} to normalize, ${toDelete.size} dups to delete.`);

    // Execute updates
    if (toUpdate.length > 0) {
        for (let i = 0; i < toUpdate.length; i += 500) {
            const batch = db.batch();
            const chunk = toUpdate.slice(i, i + 500);
            let count = 0;
            chunk.forEach(item => {
                if (!toDelete.has(item.docId)) {
                    batch.update(db.collection('indicators').doc(item.docId), { sequence: item.normalizedSeq });
                    count++;
                }
            });
            if (count > 0) {
                await batch.commit();
                console.log(`✅ Normalized chunk ${Math.floor(i / 500) + 1} (${count} items)`);
            }
        }
    }

    // Execute deletes
    if (toDelete.size > 0) {
        const ids = Array.from(toDelete);
        for (let i = 0; i < ids.length; i += 500) {
            const batch = db.batch();
            const chunk = ids.slice(i, i + 500);
            chunk.forEach(id => {
                batch.delete(db.collection('indicators').doc(id));
            });
            await batch.commit();
            console.log(`✅ Deleted duplicate chunk ${Math.floor(i / 500) + 1} (${chunk.length} items)`);
        }
    }
    console.log('✨ Aggressive cleanup finished.');
}

const major = process.argv[2] || 'วิศวกรรมคอมพิวเตอร์';
aggressiveCleanup(major).then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
