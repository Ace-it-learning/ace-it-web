import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AvatarProvider } from './context/AvatarContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import VerifyEmailSuccess from './pages/VerifyEmailSuccess';
import AuthErrorPage from './pages/AuthErrorPage';

import ExamPage from './pages/ExamPage';
import WritingExamPage from './pages/WritingExamPage';
import WritingResultPage from './pages/WritingResultPage';
import ListeningExamPage from './pages/ListeningExamPage';
import ListeningResultPage from './pages/ListeningResultPage';
import SpeakingExamPage from './pages/SpeakingExamPage';
import SpeakingResultPage from './pages/SpeakingResultPage';
import ResultPage from './pages/ResultPage';
import ReviewPage from './pages/ReviewPage';
import DiagnosticPage from './pages/DiagnosticPage';
import DiagnosticAnalysis from './components/diagnostic/DiagnosticAnalysis';
import LabPage from './pages/LabPage';
import AchievementTimeline from './pages/AchievementTimeline';
import RedemptionStore from './pages/RedemptionStore';
import UsagePage from './pages/UsagePage';
import PromptTipsPage from './pages/PromptTipsPage';
import NotebookPage from './pages/NotebookPage';

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
                  path="/writing/result/:examId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WritingResultPage />
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
                  path="/diagnostic/analysis"
                  element={
                    <ProtectedRoute>
                      <DiagnosticAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lab"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LabPage />
                      </MainLayout>
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
              </Routes>
            </BrowserRouter>
          </AvatarProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
