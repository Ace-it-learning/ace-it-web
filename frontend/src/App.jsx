import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AvatarProvider } from './context/AvatarContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LabPage from './pages/LabPage';
import MathsLabPage from './pages/MathsLabPage';
import MathsLabReview from './pages/MathsLabReview';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import VerifyEmailSuccess from './pages/VerifyEmailSuccess';
import AuthErrorPage from './pages/AuthErrorPage';

import ExamPage from './pages/ExamPage';
import WritingExamPage from './pages/WritingExamPage';
import WritingResultPage from './pages/WritingResultPage';
import WritingQuestPage from './pages/WritingQuestPage'; // Phase 23
import WritingQuestMenu from './pages/WritingQuestMenu';
import WritingQuestBriefing from './components/writing/WritingQuestBriefing'; // Phase 24
import ListeningExamPage from './pages/ListeningExamPage';
import ListeningResultPage from './pages/ListeningResultPage';
import ListeningQuestMenu from './pages/ListeningQuestMenu'; // Phase 25 (Legacy)
import ListeningBriefing from './components/listening/ListeningBriefing'; // Phase 25 (Refactor)
import ListeningQuestPage from './pages/ListeningQuestPage'; // Phase 25
import SpeakingExamPage from './pages/SpeakingExamPage';
import SpeakingResultPage from './pages/SpeakingResultPage';
import SpeakingDeliveryPage from './pages/SpeakingDeliveryPage';
import SpeakingFlowPage from './pages/SpeakingFlowPage';
import ResultPage from './pages/ResultPage';
import ReviewPage from './pages/ReviewPage';
import DiagnosticPage from './pages/DiagnosticPage';
import MathsDiagnosticPage from './pages/MathsDiagnosticPage';
import DiagnosticAnalysis from './components/diagnostic/DiagnosticAnalysis';
import MathsDiagnosticAnalysis from './components/diagnostic/MathsDiagnosticAnalysis';
import AchievementTimeline from './pages/AchievementTimeline';
import RedemptionStore from './pages/RedemptionStore';
import CardCollection from './pages/CardCollection';
import UsagePage from './pages/UsagePage';
import PromptTipsPage from './pages/PromptTipsPage';
import NotebookPage from './pages/NotebookPage';
import VocabularyPage from './pages/VocabularyPage';
import EraserChallengePage from './pages/EraserChallengePage';
import SpeakingInteractionPage from './pages/SpeakingInteractionPage';
import MathsResultPage from './pages/MathsResultPage';
import MathsDeepDivePage from './pages/MathsDeepDivePage';
import MathsLearningPage from './pages/MathsLearningPage'; // NEW
import MockExamPage from './pages/MockExamPage';
import MathsExamPage from './pages/MathsExamPage';
import QuestFactoryPage from './pages/QuestFactoryPage';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AvatarProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-portal-secret"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/factory"
                  element={
                    <ProtectedRoute>
                      <QuestFactoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={<LoginPage />}
                />
                <Route
                  path="/"
                  element={<LandingPage />}
                />
                <Route
                  path="/verify-success"
                  element={<VerifyEmailSuccess />}
                />
                <Route
                  path="/auth-error"
                  element={<AuthErrorPage />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/redemption"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RedemptionStore />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collection"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CardCollection />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/writing/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/writing/result/:resultId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingResultPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/writing/quest"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingQuestPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />{/* Phase 23 */}
                <Route
                  path="/writing/briefing/:genre"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingQuestBriefing />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/writing/menu"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingQuestMenu />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening/menu"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListeningQuestMenu />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening/briefing/:questId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListeningBriefing />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening/quest"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListeningQuestPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListeningExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/review/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ReviewPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SpeakingExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking-exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SpeakingExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/result"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SpeakingResultPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening-result/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListeningResultPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/result/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ResultPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/diagnostic"
                  element={
                    <ProtectedRoute>
                      <DiagnosticPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths-diagnostic"
                  element={
                    <ProtectedRoute>
                      <MathsDiagnosticPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/diagnostic/analysis"
                  element={
                    <ProtectedRoute>
                      <DiagnosticAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/diagnostic/analysis"
                  element={
                    <ProtectedRoute>
                      <MathsDiagnosticAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lab"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <LabPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/lab"
                  element={
                    <ProtectedRoute>
                      <MathsLabPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths-lab"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsLabPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mock-exam"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MockExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/learn/:topicId"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsLearningPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/exam/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsExamPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/exam/result/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsResultPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/exam/review/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsDeepDivePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths-lab-review"
                  element={
                    <ProtectedRoute>
                      <MathsLabReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AchievementTimeline />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usage"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UsagePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prompts"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PromptTipsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notebook"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <NotebookPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vocabulary"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <VocabularyPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eraser-challenge"
                  element={
                    <ProtectedRoute>
                      <EraserChallengePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking-interaction"
                  element={
                    <ProtectedRoute>
                      <SpeakingInteractionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/quest/delivery"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <SpeakingDeliveryPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/quest/flow"
                  element={
                    <ProtectedRoute>
                      <SpeakingFlowPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/quest/interaction"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <SpeakingInteractionPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AvatarProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
