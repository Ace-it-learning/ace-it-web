# Ace it! — Product-to-Code Index

> Quick-lookup mapping from user-facing features → source files.  
> Maintained for PM → dev handoff. Update when adding new routes or renaming modules.

---

## 🏠 Marketing & Auth

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| Landing / Home | `/` | `pages/LandingPage.jsx` | `landing/Hero`, `landing/FeaturesSection`, `landing/PricingTable`, `landing/Testimonials`, `landing/TutorSection`, `landing/MockExamSection` |
| Login / Auth | `/login` | `pages/LoginPage.jsx` | `auth/*` (Azure AD flow) |
| Auth Error | `/auth-error` | `pages/AuthErrorPage.jsx` | — |
| Email Verify Success | `/verify-success` | `pages/VerifyEmailSuccess.jsx` | — |
| Subscription / Pricing | `/subscription` | `pages/SubscriptionPage.jsx` | `payment/CheckoutForm` (Stripe) |
| Onboarding | `/onboarding` | `pages/Onboarding.jsx` | — |

---

## 📊 Dashboard & Progress

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **Main Dashboard** | `/dashboard` | `pages/Dashboard.jsx` | `dashboard/RoadmapWidget`, `dashboard/RoadmapModal`, `dashboard/MasteryRadar`, `dashboard/MasteryModal`, `dashboard/DreamProgramsModal`, `dashboard/MathRoadmapModal`, `dashboard/MathAbilityModal` |
| Account / Profile | `/account` | `pages/AccountPage.jsx` | — |
| Achievement Timeline | `/achievements` | `pages/AchievementTimeline.jsx` | — |
| Mastery / Skill Map | `/mastery` | `pages/MasteryPage.jsx` | — |
| Card Collection | `/collection` | `pages/CardCollection.jsx` | — |
| Notebook | `/notebook` | `pages/NotebookPage.jsx` | `notebook/NotebookCard` |
| Redemption Store | `/redemption` | `pages/RedemptionStore.jsx` | — |

---

## 📝 Writing Module

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **Writing Quest Menu** | `/writing/menu` | `pages/WritingQuestMenu.jsx` | — |
| **Writing Quest (Gameplay)** | `/writing/quest` | `pages/WritingQuestPage.jsx` | `writing/BrainstormingStep`, `writing/OrganizationStep`, `writing/DraftingStep`, `writing/WritingQuestBriefing` |
| Writing Briefing (by genre) | `/writing/briefing/:genre` | `pages/WritingQuestPage.jsx` | `writing/WritingQuestBriefing` |
| Writing Result (specific) | `/writing/result/:resultId` | `pages/WritingResultPage.jsx` | — |
| Writing Result (latest) | `/writing/result` | `pages/ResultPage.jsx` | — |
| Writing Lab / Review | `/lab` | `pages/LabPage.jsx` | `lab/WritingWorkspace`, `lab/WritingReview`, `lab/NextPathRecommendations` |
| Writing Studio (Mock) | `/mock/writing` | `pages/mock-eng/WritingMockStudio.jsx` | `writing/WritingStudioHeader`, `writing/WritingStudioEditor`, `writing/WritingStudioControlPanel`, `writing/WritingStudioBriefing` |

**Backend:** `routes/writingRoutes.js`, `services/WritingLabService.js`

---

## 📖 Reading Module

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **Reading Quest / General Reading** | `/reading/quest` | *(routed via exam system)* | `exam/ReadingPanel`, `reading/ParagraphInsight`, `reading/ParagraphTag`, `reading/VocabSpotlight`, `reading/ArgumentMap`, `reading/LogicConnector`, `reading/ScaffoldToolbar` |
| Reading Result (specific) | `/reading/result/:resultId` | `pages/ResultPage.jsx` | — |
| Reading Mock Studio | `/mock/reading` | `pages/mock-eng/ReadingMockStudio.jsx` | `exam/ReadingPanel`, `exam/QuestionList`, `exam/ExamHeader` |

**Backend:** `routes/examRoutes.js`, `services/EnglishMockService.js`

---

## 🎧 Listening Module

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **Listening Quest Menu** | `/listening/menu` | `pages/ListeningQuestMenu.jsx` | — |
| **Listening Quest (Gameplay)** | `/listening/quest` | `pages/ListeningQuestPage.jsx` | `listening/ListeningBriefing`, `listening/LiveListenStep`, `listening/IntegratedTaskStep`, `listening/ResultsStep`, `listening/IntegratedListeningBoard`, `listening/DataSprintBoard`, `listening/PredictionStep` |
| Listening Briefing | `/listening/briefing/:questId` | `pages/ListeningQuestPage.jsx` | `listening/ListeningBriefing` |
| Listening Result (integrated) | `/listening/result/:resultId` | `pages/ListeningResultPage.jsx` | `listening/ListeningResultsStep` |
| Listening Result (legacy) | `/listening-result/:examId` | `pages/ListeningResultPage.jsx` | — |
| Listening Mock Studio | `/mock/listening` | `pages/mock-eng/ListeningMockStudio.jsx` | `listening/Paper3AudioEngine`, `listening/DataFileViewer` |

**Backend:** `routes/speakingQuestRoutes.js` (legacy overlap), `services/SpeakingQuestService.js`

---

## 🎤 Speaking Module

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **Speaking Menu / Pillars** | `/speaking/menu` | `pages/SpeakingPillarMenu.jsx` | — |
| **Speaking Interaction (Part 1&2)** | `/speaking/interaction` | `pages/SpeakingInteractionPage.jsx` | `speaking/DeliveryScaffoldPassage`, `speaking/SpeakingWaveform` |
| Speaking Flow (Part 3 Discussion) | `/speaking/flow` | `pages/SpeakingFlowPage.jsx` | — |
| Speaking Delivery / Practice | `/speaking/delivery` | `pages/SpeakingDeliveryPage.jsx` | `speaking/DeliveryScaffoldPassage`, `speaking/PhonemeSpotlight` |
| Speaking Ideas Lab | `/speaking/ideas-lab` | `pages/SpeakingIdeasLab.jsx` | `speaking/IdeasMindMap` |
| Speaking Language Lab | `/speaking/language-lab` | `pages/SpeakingLanguageLab.jsx` | — |
| Speaking Strategies Lab | `/speaking/strategies-lab` | `pages/SpeakingStrategiesLab.jsx` | — |
| Speaking Result (specific) | `/speaking/result/:resultId` | `pages/SpeakingResultPage.jsx` | — |
| Speaking Result (latest) | `/speaking/result` | `pages/ResultPage.jsx` | — |
| Speaking Mock Studio | `/mock/speaking` | `pages/mock-eng/SpeakingMockStudio.jsx` | — |
| Speaking Mock Result | `/mock/speaking/result` | `pages/mock-eng/SpeakingResultPage.jsx` | — |

**Backend:** `routes/speakingQuestRoutes.js`, `services/SpeakingQuestService.js`, `services/TTSService.js`

---

## 🧪 Diagnostics

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| **English Diagnostic** | `/diagnostic` | `pages/DiagnosticPage.jsx` | `diagnostic/DiagnosticLanding`, `diagnostic/DiagnosticReading`, `diagnostic/DiagnosticWriting`, `diagnostic/DiagnosticListening`, `diagnostic/DiagnosticSpeaking`, `diagnostic/DiagnosticAnalysis`, `diagnostic/DiagnosticResult` |
| **Maths Diagnostic** | `/maths-diagnostic` | `pages/MathsDiagnosticPage.jsx` | `diagnostic/MathsDiagnosticLanding`, `diagnostic/MathsDiagnosticAnalysis`, `diagnostic/MathsDiagnosticResult` |

**Backend:** `routes/diagnosticRoutes.js`, `services/DiagnosticService.js`, `routes/maths/mathsDiagnosticRoutes.js`

---

## 🧮 Mathematics Module

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| Maths Ability / Profile | `/maths-ability` | `pages/MathsAbilityPage.jsx` | — |
| Maths Learning Path | `/maths-learning` | `pages/MathsLearningPage.jsx` | — |
| **Maths Lab** | `/maths-lab` | `pages/MathsLabPage.jsx` | `maths/MathsLab`, `maths/MathsQuestionCard`, `maths/MathInput`, `maths/MathStepExplainer`, `maths/SafeMath`, `maths/GeometryRenderer`, `maths/ImageUploadInput`, `maths/TutorialOverlay` |
| Maths Lab Review | `/maths-lab-review` | `pages/MathsLabReview.jsx` | — |
| Maths Deep Dive | `/maths-deepdive` | `pages/MathsDeepDivePage.jsx` | — |
| Maths Result | `/maths-result` | `pages/MathsResultPage.jsx` | — |
| Maths Mock Exam | `/mock/maths` | `pages/mock-math/MockLibraryMathPage.jsx` | — |

**Backend:** `routes/maths/mathsLabRoutes.js`, `routes/maths/mathsExamRoutes.js`, `routes/maths/mathsChatRoutes.js`, `services/*Maths*`

---

## 🎓 Mock Exams & Review

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| Mock Exam Library | `/mock-library` | `pages/MockExamLibrary.jsx` | — |
| English Mock Library | `/mock/english` | `pages/mock-eng/MockLibraryEngPage.jsx` | — |
| Review Exam | `/review/:examId` | `pages/ReviewPage.jsx` | `exam/QuestionList`, `exam/ReadingPanel` |
| General Result | `/result/:examId` | `pages/ResultPage.jsx` | — |

**Backend:** `routes/englishMockRoutes.js`, `services/EnglishMockService.js`, `services/MockAssessmentService.js`

---

## ⚙️ Admin & Utils

| Feature (User POV) | Route | Page Component | Key Components |
|---|---|---|---|
| Admin Dashboard | `/admin-portal-secret` | `pages/AdminDashboard.jsx` | — |
| Quest Factory (Admin) | `/admin/factory` | `pages/QuestFactoryPage.jsx` | — |
| Eraser Challenge | `/eraser-challenge` | `pages/EraserChallengePage.jsx` | — |
| Vocabulary Builder | `/vocabulary` | `pages/VocabularyPage.jsx` | `tutor/VocabularySidekick`, `tutor/VocabCard`, `tutor/DecoderCard`, `tutor/PolisherCard` |
| Prompt Tips | `/prompt-tips` | `pages/PromptTipsPage.jsx` | — |
| Quest Lab Review | `/quest-lab-review` | `pages/QuestLabReview.jsx` | — |

---

## 🔑 How to Use This Index

**As a PM, say:**
> "Fix the Writing Quest briefing screen" → I open `pages/WritingQuestPage.jsx` + `writing/WritingQuestBriefing`

> "Add a tooltip to the Dashboard roadmap" → I open `pages/Dashboard.jsx` + `dashboard/RoadmapWidget` + `dashboard/RoadmapModal`

> "Update Speaking Part 1 waveforms" → I open `pages/SpeakingInteractionPage.jsx` + `speaking/SpeakingWaveform`

**No project-wide scans needed.**

---

## Maintenance

- **Add a new page?** Append to the table above with route, page, and key components.
- **Rename a component?** Update the relevant row(s).
- **New module?** Add a new `## Section` with the module name.
