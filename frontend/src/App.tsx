import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// ── Auth pages (eager) ────────────────────────────────────────
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// ── Dashboard pages (lazy loaded — code-split) ───────────────
// ── Dashboard pages (lazy loaded — code-split) ───────────────
const AdminAnalytics = lazy(() => import('./pages/admin/analytics/AdminAnalytics'));
const AdminDashboard   = lazy(() => import('./pages/admin/system/AdminDashboard'));
const AdminStudents         = lazy(() => import('./pages/admin/students/AdminStudents'));
const AdminDepartments      = lazy(() => import('./pages/admin/academics/AdminDepartments'));
const AdminAssets = lazy(() => import('./pages/admin/infrastructure/AdminAssets'));
const FeeStructureBuilder   = lazy(() => import('./pages/admin/financials/FeeStructureBuilder'));
const TimetableBuilder      = lazy(() => import('./pages/admin/academics/TimetableBuilder'));
const AdminStaff            = lazy(() => import('./pages/admin/staff/AdminStaff'));
const AdminAttendance  = lazy(() => import('./pages/admin/hr/AdminAttendance'));
const AdminMarks       = lazy(() => import('./pages/admin/academic-records/AdminMarks'));
const FacultyTimetable    = lazy(() => import('./pages/staff/academic/FacultyTimetable'));
const AdminFees           = lazy(() => import('./pages/admin/financials/AdminFees'));
const AdminReports     = lazy(() => import('./pages/admin/analytics/AdminReports'));
const AdminSettings    = lazy(() => import('./pages/admin/system/AdminSettings'));
const AdminTimetable   = lazy(() => import('./pages/admin/academics/AdminTimetable'));
const AdminBroadcast   = lazy(() => import('./pages/admin/communications/AdminBroadcast'));
const AdminInventory   = lazy(() => import('./pages/admin/infrastructure/AdminInventory'));
const AdminAppraisal   = lazy(() => import('./pages/admin/hr/AdminAppraisal'));
const AdminLeaves      = lazy(() => import('./pages/admin/hr/AdminLeaves'));
const AdminAccreditation = lazy(() => import('./pages/admin/accreditation/AdminAccreditation'));
const AdminRecruitment   = lazy(() => import('./pages/admin/hr/AdminRecruitment'));
const AdminBackup        = lazy(() => import('./pages/admin/system/AdminBackup'));
const AdminSecurity      = lazy(() => import('./pages/admin/system/AdminSecurity'));
const AdminStaffRegister = lazy(() => import('./pages/admin/staff/AdminStaffRegister'));
const AdminStaffEdit = lazy(() => import('./pages/admin/staff/AdminStaffEdit'));
const AdminStudentRegister = lazy(() => import('./pages/admin/students/AdminStudentRegister'));
const AdminStudentEdit = lazy(() => import('./pages/admin/students/AdminStudentEdit'));
const AdminSubjects = lazy(() => import('./pages/admin/academics/AdminSubjects'));
const AdminApprovalQueue = lazy(() => import('./pages/admin/approvals/AdminApprovalQueue'));

const StaffDashboard   = lazy(() => import('./pages/staff/core/StaffDashboard'));
const StaffProfile     = lazy(() => import('./pages/staff/core/StaffProfile'));
const StaffAttendance  = lazy(() => import('./pages/staff/records/StaffAttendance'));
const StaffMarks       = lazy(() => import('./pages/staff/records/StaffMarks'));
const StaffClasses     = lazy(() => import('./pages/staff/academic/StaffClasses'));
const StaffSalary      = lazy(() => import('./pages/staff/administration/StaffSalary'));
const StaffRemarks     = lazy(() => import('./pages/staff/student-support/StaffRemarks'));
const StaffTasks       = lazy(() => import('./pages/staff/administration/StaffTasks'));
const StaffStudents    = lazy(() => import('./pages/staff/student-support/StaffStudents'));
const StaffQuestionBank = lazy(() => import('./pages/staff/resources/StaffQuestionBank'));
const StaffLectures    = lazy(() => import('./pages/staff/academic/StaffLectures'));
const StaffDuty        = lazy(() => import('./pages/staff/administration/StaffDuty'));
const StaffSyllabus    = lazy(() => import('./pages/staff/academic/StaffSyllabus'));
const StaffCounseling  = lazy(() => import('./pages/staff/student-support/StaffCounseling'));
const StaffParentComm  = lazy(() => import('./pages/staff/student-support/StaffParentComm'));
const StaffMarksWizard = lazy(() => import('./pages/staff/records/StaffMarksWizard'));
const StaffAssignments = lazy(() => import('./pages/staff/academic/StaffAssignments'));
const StaffSubjects = lazy(() => import('./pages/staff/academic/StaffSubjects'));
const FacultyAppraisal = lazy(() => import('./pages/staff/administration/FacultyAppraisal'));
const CounselorTimetableBuilder = lazy(() => import('./pages/staff/academic/CounselorTimetableBuilder'));
const StaffSubjectAllocation = lazy(() => import('./pages/staff/core/SubjectAllocation'));
const TimetableAllocation = lazy(() => import('./pages/staff/core/TimetableAllocation'));
const SectionTimetableMaster = lazy(() => import('./pages/staff/academic/SectionTimetableMaster'));


const StudentDashboard = lazy(() => import('./pages/student/core/StudentDashboard'));
const StudentProfile   = lazy(() => import('./pages/student/core/StudentProfile'));
const StudentAttendance = lazy(() => import('./pages/student/records/StudentAttendance'));
const StudentMarks     = lazy(() => import('./pages/student/records/StudentMarks'));
const StudentFees      = lazy(() => import('./pages/student/financials/StudentFees'));
const StudentRemarks   = lazy(() => import('./pages/student/records/StudentRemarks'));
const StudentGrievance = lazy(() => import('./pages/student/support/StudentGrievance'));
const StudentPlacement = lazy(() => import('./pages/student/resources/StudentPlacement'));
const StudentSubmissions = lazy(() => import('./pages/student/academic/StudentSubmissions'));
const StudentLibrary   = lazy(() => import('./pages/student/resources/StudentLibrary'));
const StudentLeaderboard = lazy(() => import('./pages/student/resources/StudentLeaderboard'));
const StudentTimetable = lazy(() => import('./pages/student/academic/StudentTimetable'));
const StudentID        = lazy(() => import('./pages/student/core/StudentID'));
const StudentInbox     = lazy(() => import('./pages/student/support/StudentInbox'));
const StudentElectives = lazy(() => import('./pages/student/academic/StudentElectives'));
const StudentFeedbackSubmission = lazy(() => import('./pages/student/feedback/StudentFeedbackSubmission'));
const StudentSyllabus = lazy(() => import('./pages/student/academic/StudentSyllabus'));
const AttendanceMarking = lazy(() => import('./pages/staff/academic/AttendanceMarking'));
const StudentAttendanceView = lazy(() => import('./pages/student/records/StudentAttendanceView'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 min cache
      retry: 1,
    },
  },
});

const morals = [
  "Education is the most powerful weapon which you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Intelligence plus character - that is the goal of true education.",
  "Integrity is doing the right thing, even when no one is watching.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The roots of education are bitter, but the fruit is sweet.",
  "Your attitude, not your aptitude, will determine your altitude.",
  "Knowledge will give you power, but character respect.",
  "Innovation distinguishes between a leader and a follower.",
  "The expert in anything was once a beginner."
];

const TransitionLoader = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [currentMoral, setCurrentMoral] = React.useState("");

  React.useEffect(() => {
    // Pick random moral
    setCurrentMoral(morals[Math.floor(Math.random() * morals.length)]);
    
    // Show loader
    setIsTransitioning(true);
    
    // Hide after 2.5 seconds (between 2 and 4 seconds as requested)
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px] animate-pulse" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-xl px-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-[20px] animate-pulse shadow-2xl shadow-indigo-600/50" />
          </div>
        </motion.div>
        
        <div className="space-y-6">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentMoral}
            className="text-white text-2xl font-serif italic leading-relaxed tracking-tight"
          >
            "{currentMoral}"
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5 }}
            className="h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Syncing Institution Data
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <TransitionLoader />
          <MainAppStructure />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const MainAppStructure = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="h-screen bg-slate-900" />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/feedback" element={<StudentFeedbackSubmission />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/assets" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssets /></ProtectedRoute>} />
          <Route path="/admin/students/register" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentRegister /></ProtectedRoute>} />
          <Route path="/admin/students/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentEdit /></ProtectedRoute>} />
          <Route path="/admin/staff/register" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaffRegister /></ProtectedRoute>} />
          <Route path="/admin/staff/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaffEdit /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimetable /></ProtectedRoute>} />
          <Route path="/admin/broadcast" element={<ProtectedRoute allowedRoles={['admin']}><AdminBroadcast /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/marks" element={<ProtectedRoute allowedRoles={['admin']}><AdminMarks /></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminFees /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventory /></ProtectedRoute>} />
          <Route path="/admin/appraisal" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppraisal /></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeaves /></ProtectedRoute>} />
          <Route path="/admin/accreditation" element={<ProtectedRoute allowedRoles={['admin']}><AdminAccreditation /></ProtectedRoute>} />
          <Route path="/admin/recruitment" element={<ProtectedRoute allowedRoles={['admin']}><AdminRecruitment /></ProtectedRoute>} />
          <Route path="/admin/backup" element={<ProtectedRoute allowedRoles={['admin']}><AdminBackup /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['admin']}><AdminSecurity /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          <Route path="/staff/timetable" element={<ProtectedRoute allowedRoles={['staff']}><FacultyTimetable /></ProtectedRoute>} />
          <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffProfile /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubjects /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/timetable/builder" element={<ProtectedRoute allowedRoles={['admin']}><TimetableBuilder /></ProtectedRoute>} />
          <Route path="/admin/fee-builder" element={<ProtectedRoute allowedRoles={['admin']}><FeeStructureBuilder /></ProtectedRoute>} />
          <Route path="/admin/subjects/proposals" element={<ProtectedRoute allowedRoles={['admin']}><AdminApprovalQueue /></ProtectedRoute>} />

          {/* Staff routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><AttendanceMarking /></ProtectedRoute>} />
          <Route path="/staff/marks" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffMarks /></ProtectedRoute>} />
          <Route path="/staff/classes" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffClasses /></ProtectedRoute>} />
          <Route path="/staff/salary" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffSalary /></ProtectedRoute>} />
          <Route path="/staff/remarks" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffRemarks /></ProtectedRoute>} />
          <Route path="/staff/tasks" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffTasks /></ProtectedRoute>} />
          <Route path="/staff/students" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffStudents /></ProtectedRoute>} />
          <Route path="/staff/questions" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffQuestionBank /></ProtectedRoute>} />
          <Route path="/staff/lectures" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffLectures /></ProtectedRoute>} />
          <Route path="/staff/duty" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffDuty /></ProtectedRoute>} />
          <Route path="/staff/syllabus" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffSyllabus /></ProtectedRoute>} />
          <Route path="/staff/appraisal" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><FacultyAppraisal /></ProtectedRoute>} />
          <Route path="/staff/syllabus/:id" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffSyllabus /></ProtectedRoute>} />
          <Route path="/staff/counseling" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffCounseling /></ProtectedRoute>} />
          <Route path="/staff/parent-comm" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffParentComm /></ProtectedRoute>} />
          <Route path="/staff/marks-wizard" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffMarksWizard /></ProtectedRoute>} />
          <Route path="/staff/assignments" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffAssignments /></ProtectedRoute>} />
          <Route path="/staff/subjects" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffSubjects /></ProtectedRoute>} />
          <Route path="/staff/subject-allocation" element={<ProtectedRoute allowedRoles={['staff', 'non-teaching']}><StaffSubjectAllocation /></ProtectedRoute>} />
          <Route path="/staff/timetable-allocation" element={<ProtectedRoute allowedRoles={['staff']}><CounselorTimetableBuilder /></ProtectedRoute>} />
          <Route path="/staff/section-timetable" element={<ProtectedRoute allowedRoles={['staff']}><SectionTimetableMaster /></ProtectedRoute>} />


          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendanceView /></ProtectedRoute>} />
          <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['student']}><StudentMarks /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><StudentFees /></ProtectedRoute>} />
          <Route path="/student/remarks" element={<ProtectedRoute allowedRoles={['student']}><StudentRemarks /></ProtectedRoute>} />
          <Route path="/student/grievance" element={<ProtectedRoute allowedRoles={['student']}><StudentGrievance /></ProtectedRoute>} />
          <Route path="/student/placement" element={<ProtectedRoute allowedRoles={['student']}><StudentPlacement /></ProtectedRoute>} />
          <Route path="/student/submissions" element={<ProtectedRoute allowedRoles={['student']}><StudentSubmissions /></ProtectedRoute>} />
          <Route path="/student/library" element={<ProtectedRoute allowedRoles={['student']}><StudentLibrary /></ProtectedRoute>} />
          <Route path="/student/electives" element={<ProtectedRoute allowedRoles={['student']}><StudentElectives /></ProtectedRoute>} />
          <Route path="/student/leaderboard" element={<ProtectedRoute allowedRoles={['student']}><StudentLeaderboard /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><StudentTimetable /></ProtectedRoute>} />
          <Route path="/student/id-card" element={<ProtectedRoute allowedRoles={['student']}><StudentID /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentInbox /></ProtectedRoute>} />
          <Route path="/student/syllabus/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentSyllabus /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
