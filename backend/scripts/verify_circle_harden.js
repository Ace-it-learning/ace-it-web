Can
        });

        if (!lesson || !lesson.tasks || lesson.tasks.length === 0) {
            console.error('[Verify] ❌ Failed to fetch questions from bank.');
            return;
        }

        const q = lesson.tasks[0];
        console.log(`[Verify] ✅ Successfully fetched question: ${q.id}`);
        console.log(`[Verify] - Standard Version: ${q.standard_version}`);
        console.log(`[Verify] - Is Factory: ${q.is_factory}`);
        console.log(`[Verify] - Answer (Root): ${q.answer}`);
        console.log(`[Verify] - Solution Steps: ${Array.isArray(q.solution_steps) ? 'Array (Correct)' : 'Missing!'}`);

        // 2. Test Grading Logic (Simulate Review Page)
        console.log('[Verify] Testing AI Grader output simulation...');
        const mockSubmission = {
            questionId: q.id,
            student_input: q.answer, // Correct answer
            topic: 'math_geo_circles'
        };

        const result = await MathsLabService.gradeShortAnswers({
            submissions: [mockSubmission],
            uid: 'test_user',
            topic: 'math_geo_circles'
        });

        const graded = result[0];
        console.log(`[Verify] ✅ Graded Result: Score ${graded.score}/${graded.maxScore}`);
        console.log(`[Verify] - AI Rubric present: ${!!graded.aiFeedback}`);
        console.log(`[Verify] - Step-by-Step present: ${!!graded.solution_steps}`);

        if (graded.score > 0 && graded.solution_steps) {
            console.log('[Verify] 🔥 HARDENING VERIFIED: Logic is stable.');
        } else {
            console.error('[Verify] ⚠️ Warning: Score is still zero or steps missing.');
        }

    } catch (err) {
        console.error('[Verify] ❌ Error during verification:', err);
    }
    process.exit(0);
}

verifyHarden();
