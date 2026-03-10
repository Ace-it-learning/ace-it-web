/**
 * useMockGate — checks if the user has completed a full set of mock exam papers
 * for a given subject, which unlocks the "Projected DSE Grade" display.
 *
 * English gate: needs at least 1 submission each from reading, writing,
 *               listening AND speaking-type papers (4 total paper types).
 * Maths gate:   needs at least 1 submission each for Paper 1 AND Paper 2
 *               (determined by examId prefix "maths_p1" / "maths_p2").
 *               Currently no maths mocks → will always return false.
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// English: Paper types inferred from examId prefixes / tab identifiers stored
// alongside the submission. Fallback: we classify by the folder the mock was in.
// Realistically, English reading mocks store their examId and are the only ones
// saved to exam_submissions for now. Writing/listening/speaking might save
// differently. We gate on "at least 1 submission" per tab type by inspecting
// the examId or a `type` field if present.

const ENGLISH_PAPER_TYPES = ['reading', 'writing', 'listening', 'speaking'];
const MATHS_PAPER_TYPES = ['maths_p1', 'maths_p2'];

function classifySubmission(sub) {
    const id = (sub.examId || '').toLowerCase();
    const type = (sub.type || sub.subject || '').toLowerCase();

    // Direct type field (future-proof)
    if (type) {
        if (type.includes('read')) return 'reading';
        if (type.includes('writ')) return 'writing';
        if (type.includes('listen')) return 'listening';
        if (type.includes('speak')) return 'speaking';
        if (type.includes('maths') || type.includes('math')) {
            if (id.includes('p1') || id.includes('paper1') || id.includes('paper_1')) return 'maths_p1';
            return 'maths_p2';
        }
    }

    // Infer from examId
    if (id.includes('math') || id.includes('maths')) {
        if (id.includes('p1') || id.includes('paper1')) return 'maths_p1';
        return 'maths_p2';
    }
    if (id.includes('listen')) return 'listening';
    if (id.includes('speak')) return 'speaking';
    if (id.includes('writ')) return 'writing';

    // Default: reading (English reading mocks are saved here today)
    return 'reading';
}

export function useMockGate(uid) {
    const [englishUnlocked, setEnglishUnlocked] = useState(false);
    const [mathsUnlocked, setMathsUnlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        const check = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'exam_submissions'),
                    where('uid', '==', uid)
                );
                const snap = await getDocs(q);

                const completedTypes = new Set();
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    const type = classifySubmission(data);
                    completedTypes.add(type);
                });

                // English gate: all 4 paper types done
                const englishDone = ENGLISH_PAPER_TYPES.every(t => completedTypes.has(t));
                // Maths gate: both maths papers done
                const mathsDone = MATHS_PAPER_TYPES.every(t => completedTypes.has(t));

                setEnglishUnlocked(englishDone);
                setMathsUnlocked(mathsDone);
            } catch (err) {
                console.error('[useMockGate] Failed to check submissions:', err);
            } finally {
                setLoading(false);
            }
        };

        check();
    }, [uid]);

    return { englishUnlocked, mathsUnlocked, loading };
}
