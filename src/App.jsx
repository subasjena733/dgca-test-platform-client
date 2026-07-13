import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import QuestionsPage from "./pages/admin/QuestionsPage";
import MockTestsPage from "./pages/admin/MockTestsPage";
import MockTestDetailsPage from "./pages/admin/MockTestDetailsPage";
import StudentMockTestsPage from "./pages/student/StudentMockTestsPage";
import StudentMockInstructionsPage from "./pages/student/StudentMockInstructionsPage";
import StudentAttemptPage from "./pages/student/StudentAttemptPage";
import StudentResultPage from "./pages/student/StudentResultPage";
import StudentReviewPage from "./pages/student/StudentReviewPage";
import StudentPerformancePage from "./pages/student/StudentPerformancePage";
import StudentLeaderboardPage from "./pages/student/StudentLeaderboardPage";
import AdminLeaderboardPage from "./pages/admin/AdminLeaderboardPage";
import AdminReviewPage from "./pages/admin/AdminReviewPage";
import AdminLeaderboardListPage from "./pages/admin/AdminLeaderboardListPage";
import PendingRegistrationsPage from "./pages/admin/PendingRegistrationsPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import PasswordResetRequestsPage from "./pages/admin/PasswordResetRequestsPage";
import SubjectManagementPage from "./pages/admin/SubjectManagementPage";
import QuestionBankPage from "./pages/admin/QuestionBankPage";
import LandingPage from "./components/landingPageComponents/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/mock-tests"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentMockTestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <QuestionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/mock-tests"
        element={
          <ProtectedRoute allowedRole="admin">
            <MockTestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/mock-tests/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <MockTestDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/mock-tests/:id"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentMockInstructionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/mock-tests/:id/attempt"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAttemptPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/result"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/review/:attemptId"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentReviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/performance"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentPerformancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/leaderboard/:mockTestId"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLeaderboardPage />
        </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leaderboard/:mockTestId"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLeaderboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/review/:attemptId"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminReviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leaderboards"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout>
              <AdminLeaderboardListPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/pending-registrations"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout>
              <PendingRegistrationsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/change-password"
        element={
          <ProtectedRoute allowedRole="student">
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/password-reset-requests"
        element={
          <ProtectedRoute allowedRoles="admin">
            <AdminLayout>
              <PasswordResetRequestsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRole="admin">
            <SubjectManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/question-bank"
        element={
          <ProtectedRoute allowedRole="admin">
            <QuestionBankPage />
          </ProtectedRoute>
        }
      />
    </Routes> 
  );
}

export default App;