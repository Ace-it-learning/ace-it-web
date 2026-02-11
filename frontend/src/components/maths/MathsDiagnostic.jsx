import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DiagnosticLayout } from '../shared';
import MathsQuestionCard from './MathsQuestionCard';

/**
 * Maths Diagnostic Component
 * Adaptive diagnostic test for HKDSE Maths
 */
const MathsDiagnostic = ({ onSubmit }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMathsDiagnostic();
    }, []);

    const fetchMathsDiagnostic = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/maths/diagnostic/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setQuestions(data.questions || []);
        } catch (error) {
            console.error('Failed to fetch Maths diagnostic:', error);
            alert('Failed to load Maths diagnostic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({ answers });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Maths Calibration...</p>
                </div>
            </div>
        );
    }

    return (
        <DiagnosticLayout
            title="Maths Calibration"
            estimatedTime="10 mins"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Submit Maths Check"
            subjectColor="purple"
        >
            <div className="max-w-4xl mx-auto space-y-4">
                {questions.map((q, i) => (
                    <MathsQuestionCard
                        key={q.id}
                        question={q}
                        answer={answers[q.id]}
                        onChange={handleAnswerChange}
                        disabled={isSubmitting}
                        questionNumber={i + 1}
                        showChallengeBadge={true}
                    />
                ))}
            </div>
        </DiagnosticLayout>
    );
};

export default MathsDiagnostic;
