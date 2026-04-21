import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AvatarProvider } from './context/AvatarContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { HeaderProvider } from './context/HeaderContext';
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

import WritingResultPage from './pages/WritingResultPage';
import WritingQuestPage from './pages/WritingQuestPage'; 
import WritingQuestMenu from './pages/WritingQuestMenu';
import WritingQuestBriefing from './components/writing/WritingQuestBriefing';
import ListeningResultPage from './pages/ListeningResultPage';
import ListeningQuestMenu from './pages/ListeningQuestMenu'; // Phase 25 (Legacy)
import ListeningBriefing from './components/listening/ListeningBriefing'; // Phase 25 (Refactor)
import ListeningQuestPage from './pages/ListeningQuestPage'; // Phase 25
import SpeakingResultPage from './pages/SpeakingResultPage';
import SpeakingDeliveryPage from './pages/SpeakingDeliveryPage';
import SpeakingFlowPage from './pages/SpeakingFlowPage';
import AchievementTimeline from './pages/AchievementTimeline';
import QuestLabReview from './pages/QuestLabReview'; 
import RedemptionStore from './pages/RedemptionStore';
import DiagnosticPage from './pages/DiagnosticPage';
import MathsDiagnosticPage from './pages/MathsDiagnosticPage';
import DiagnosticAnalysis from './components/diagnostic/DiagnosticAnalysis';
import MathsDiagnosticAnalysis from './components/diagnostic/MathsDiagnosticAnalysis';
import ResultPage from './pages/ResultPage';
import ReviewPage from './pages/ReviewPage';
import CardCollection from './pages/CardCollection';

import PromptTipsPage from './pages/PromptTipsPage';
import NotebookPage from './pages/NotebookPage';
import VocabularyPage from './pages/VocabularyPage';
import EraserChallengePage from './pages/EraserChallengePage';
import SpeakingInteractionPage from './pages/SpeakingInteractionPage';
import SpeakingStrategiesLab from './pages/SpeakingStrategiesLab';
import SpeakingLanguageLab from './pages/SpeakingLanguageLab';
import SpeakingIdeasLab from './pages/SpeakingIdeasLab';
import MathsResultPage from './pages/MathsResultPage';
import MathsDeepDivePage from './pages/MathsDeepDivePage';
import MathsLearningPage from './pages/MathsLearningPage'; 
import MockExamLibrary from './pages/MockExamLibrary';
import SpeakingPillarMenu from './pages/SpeakingPillarMenu';
import QuestFactoryPage from './pages/QuestFactoryPage';
import MasteryPage from './pages/MasteryPage';
import MathsAbilityPage from './pages/MathsAbilityPage';
import AccountPage from './pages/AccountPage';
import ErrorBoundary from './components/ErrorBoundary';

import ScrollToTop from './components/utils/ScrollToTop';

import SubscriptionPage from './pages/SubscriptionPage';
import FeaturesPage from './pages/FeaturesPage.jsx';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
        <HeaderProvider>
          <AvatarProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SubscriptionPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
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
                  path="/features"
                  element={<FeaturesPage />}
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
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AccountPage />
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
                  path="/writing/result"
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
                  path="/reading/result/:resultId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <QuestLabReview />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listening/result/:resultId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <QuestLabReview />
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
                  path="/speaking/menu"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SpeakingPillarMenu />
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
                      <ListeningQuestPage />
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
                  path="/speaking/result/:resultId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SpeakingResultPage />
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
                      <MainLayout>
                        <MockExamLibrary />
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
                  path="/speaking/delivery"
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
                <Route
                  path="/speaking/quest/interaction-lab"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <SpeakingStrategiesLab />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/quest/language"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <SpeakingLanguageLab />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speaking/quest/ideas"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <SpeakingIdeasLab />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/ability"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MathsAbilityPage />
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
                  path="/english/mastery"
                  element={
                    <ProtectedRoute>
                      <MainLayout fullWidth={true}>
                        <MasteryPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maths/mastery"
                  element={<Navigate to="/maths/ability" replace />}
                />
              </Routes>
            </BrowserRouter>
          </AvatarProvider>
        </HeaderProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
