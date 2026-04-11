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

const ENGLISH_PAPER_TYPES = ['reading', 'writing', 'listening', 'speaking'];
const MATHS_PAPER_TYPES = ['maths_p1', 'maths_p2'];


export function useMockGate(uid) {
    const [englishUnlocked, setEnglishUnlocked] = useState(false);
    const [mathsUnlocked, setMathsUnlocked] = useState(false);
    const [completedTypes, setCompletedTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid || uid === 'guest') {
            setLoading(false);
            setEnglishUnlocked(false);
            setMathsUnlocked(false);
            setCompletedTypes([]);
            return;
        }

        const check = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/stats/unlocks?uid=${uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setEnglishUnlocked(data.englishUnlocked || false);
                    setMathsUnlocked(data.mathsUnlocked || false);
                    setCompletedTypes(data.completedTypes || []);
                }
            } catch (err) {
                console.error('[useMockGate] Failed to fetch unlocks:', err);
            } finally {
                setLoading(false);
            }
        };

        check();
    }, [uid]);

    return { englishUnlocked, mathsUnlocked, completedTypes, loading };
}
