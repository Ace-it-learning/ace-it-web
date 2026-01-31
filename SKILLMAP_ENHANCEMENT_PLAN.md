# Skill Map Enhancement Plan

## Overview
Transform the current static Skill Map into a dynamic, intelligent learning profile system that adapts to student progress and provides personalized recommendations.

---

## Phase 1: Foundation - Enhanced Data Structure (Week 1-2)

### Goals
- Redesign Skill Map schema with granular tracking
- Implement versioning for backward compatibility
- Add timestamp tracking

### Tasks
1. **Update Firestore Schema**
   - Create new `skill_map_v2` field structure
   - Migrate existing `skillMap` data
   - Add `diagnostic_timestamp`, `last_updated`

2. **Extend DiagnosticService**
   - Update `generateSkillMap()` to return enhanced structure
   - Add per-skill breakdown (Reading, Writing, Listening, Speaking)
   - Include micro-skills (Grammar, Vocabulary, Pronunciation)

3. **Database Migration Script**
   - Convert existing skill maps to new format
   - Preserve historical data

**Deliverables:**
- `SkillMapV2.schema.json` - New data structure
- `migrate_skillmap.js` - Migration script
- Updated `DiagnosticService.js`

---

## Phase 2: Dynamic Updates (Week 3-4)

### Goals
- Auto-update skill map after each mock exam
- Track improvement velocity
- Store performance history

### Tasks
1. **Create SkillMapService**
   - `updateFromMockExam(uid, examResults)` - Recalculate levels
   - `calculateImprovementRate(uid)` - Track progress velocity
   - `detectPlateau(uid)` - Identify stagnation

2. **Integrate with Mock Exam Flow**
   - Hook into exam submission endpoint
   - Trigger skill map update after grading
   - Store performance snapshot in history

3. **Add History Tracking**
   - Create `skill_history` subcollection
   - Store snapshots with timestamps
   - Enable trend analysis

**Deliverables:**
- `services/SkillMapService.js`
- Updated mock exam endpoints
- History visualization data structure

---

## Phase 3: Learning Preferences & Personalization (Week 5-6)

### Goals
- Capture learning style preferences
- Personalize study recommendations
- Optimize study session timing

### Tasks
1. **Add Preference Collection**
   - Create onboarding questionnaire
   - Store in `learning_preferences` field
   - Update profile endpoint

2. **Implement Recommendation Engine**
   - `getPersonalizedExercises(uid)` - Match to learning style
   - `suggestStudySchedule(uid)` - Optimal timing
   - `adaptDifficulty(uid)` - Dynamic challenge level

3. **Frontend Preference UI**
   - Settings page for preferences
   - Visual learning style quiz
   - Study schedule builder

**Deliverables:**
- Preference collection UI
- `RecommendationService.js`
- Personalized dashboard

---

## Phase 4: AI-Powered Weakness Analysis (Week 7-8)

### Goals
- Prioritize weaknesses by impact
- Generate actionable improvement plans
- Predict fix difficulty

### Tasks
1. **Weakness Prioritization Algorithm**
   - Calculate impact score (effect on overall grade)
   - Estimate fixability (based on historical data)
   - Determine urgency (time to exam)

2. **AI-Driven Action Plans**
   - Use Gemini to generate specific drills
   - Create weekly improvement roadmaps
   - Suggest targeted exercises

3. **Common Mistake Tracking**
   - Parse exam submissions for patterns
   - Categorize errors (grammar, vocab, structure)
   - Track frequency and trends

**Deliverables:**
- `WeaknessAnalyzer.js`
- AI prompt templates for action plans
- Mistake pattern database

---

## Phase 5: Predictive Analytics (Week 9-10)

### Goals
- Predict DSE performance
- Estimate readiness timeline
- Calculate required study hours

### Tasks
1. **Build Prediction Model**
   - Analyze historical performance data
   - Calculate improvement trajectories
   - Generate confidence intervals

2. **Readiness Assessment**
   - Define "exam-ready" criteria
   - Estimate date to reach target grade
   - Recommend study intensity

3. **Progress Dashboard**
   - Visual charts showing predictions
   - Milestone tracking
   - Motivational insights

**Deliverables:**
- `PredictionService.js`
- Progress dashboard UI
- Readiness calculator

---

## Phase 6: Advanced Features (Week 11-12)

### Goals
- Peer comparison (anonymized)
- Adaptive mock exam difficulty
- ML-based study path optimization

### Tasks
1. **Peer Benchmarking**
   - Anonymize and aggregate user data
   - Show percentile rankings
   - "Students like you improved by..." insights

2. **Adaptive Difficulty Engine**
   - Adjust mock exam difficulty based on skill map
   - Implement spaced repetition for weak areas
   - Balance challenge and confidence

3. **ML Study Path Optimizer**
   - Train model on successful student patterns
   - Recommend optimal exercise sequences
   - A/B test different learning paths

**Deliverables:**
- Peer comparison dashboard
- Adaptive difficulty algorithm
- ML model training pipeline

---

## Implementation Strategy

### Quick Wins (Start Immediately)
1. ✅ Fix `diagnostic_completed` flag (DONE)
2. Add `diagnostic_timestamp` to track when diagnostic was taken
3. Store full diagnostic results in separate field

### Parallel Development
- **Backend Team**: Phases 1-2 (Data structure + Dynamic updates)
- **Frontend Team**: Phase 3 (Preferences UI)
- **AI/ML Team**: Phases 4-5 (Weakness analysis + Predictions)

### Testing Approach
- Unit tests for each service
- Integration tests for skill map updates
- A/B testing for recommendation algorithms
- User acceptance testing with real students

### Rollout Plan
1. **Beta (Week 8)**: Release to 10% of users
2. **Staged Rollout (Week 10)**: 50% of users
3. **Full Launch (Week 12)**: All users

---

## Success Metrics

### Quantitative
- **Engagement**: 30% increase in mock exam completion rate
- **Retention**: 20% reduction in user churn
- **Performance**: 15% average improvement in mock exam scores
- **Accuracy**: Prediction model within ±0.5 grade levels

### Qualitative
- User satisfaction surveys (target: 4.5/5 stars)
- Positive feedback on personalized recommendations
- Reduced support tickets about "what to study next"

---

## Technical Considerations

### Database Design
- Use Firestore subcollections for history (scalability)
- Index on `uid`, `timestamp` for fast queries
- Implement data retention policy (keep 1 year of history)

### Performance
- Cache skill map calculations (Redis)
- Batch process updates for efficiency
- Lazy load historical data

### Privacy & Security
- Anonymize data for peer comparison
- User consent for data usage
- GDPR-compliant data deletion

---

## Next Steps

1. **Review this plan** - Confirm priorities and timeline
2. **Create detailed task breakdown** for Phase 1
3. **Set up project tracking** (GitHub Projects or Jira)
4. **Assign team members** to each phase
5. **Begin Phase 1 implementation**

Would you like me to start with Phase 1 implementation, or would you prefer to adjust the plan first?
