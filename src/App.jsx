import './App.css'
import './dashboard.css'
import './doctor-dashboard.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DoctorLayout from './components/dashboard/DoctorLayout'
import ProtectedDashboardRoute from './components/dashboard/ProtectedDashboardRoute'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Features from './pages/Features'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Login from './pages/Login'
import Services from './pages/Services'
import {
  AdminConsultationHistoryPage,
  AdminAppointmentsPage,
  AdminCompletedAppointmentsPage,
  AdminDashboardPage,
  AdminDoctorsPage,
  AdminDoctorApprovalsPage,
  AdminDocumentsPage,
  AdminPatientsPage,
  AdminPatientRecordsPage,
  AdminPendingAppointmentsPage,
  AdminRecordsPage,
  AdminPrescriptionsPage,
  AdminLiveConsultationsPage,
  AdminNotificationsPage,
  AdminProfilePage,
  AdminReportsPage,
  AdminSettingsPage,
} from './pages/admin/AdminPages'
import {
  DoctorDashboardPage,
  DoctorPatientsPage,
  DoctorProfilePage,
  DoctorRecordsPage,
  DoctorSchedulePage,
} from './pages/doctor/DoctorPages'
import {
  PatientAppointmentsPage,
  PatientDashboardPage,
  PatientProfilePage,
  PatientRecordsPage,
} from './pages/patient/PatientPages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="services" element={<Services />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="features" element={<Features />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>

        <Route path="login" element={<Login />} />

        <Route element={<ProtectedDashboardRoute role="admin" />}>
          <Route path="admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="doctors/approvals" element={<AdminDoctorApprovalsPage />} />
            <Route path="patients" element={<AdminPatientsPage />} />
            <Route path="patients/records" element={<AdminPatientRecordsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="appointments/pending" element={<AdminPendingAppointmentsPage />} />
            <Route path="appointments/completed" element={<AdminCompletedAppointmentsPage />} />
            <Route path="records" element={<AdminRecordsPage />} />
            <Route path="records/medical" element={<AdminRecordsPage />} />
            <Route path="records/prescriptions" element={<AdminPrescriptionsPage />} />
            <Route path="records/documents" element={<AdminDocumentsPage />} />
            <Route path="telemedicine" element={<AdminLiveConsultationsPage />} />
            <Route path="telemedicine/live" element={<AdminLiveConsultationsPage />} />
            <Route path="telemedicine/history" element={<AdminConsultationHistoryPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedDashboardRoute role="doctor" />}>
          <Route path="doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboardPage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="schedule" element={<DoctorSchedulePage />} />
            <Route path="records" element={<DoctorRecordsPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedDashboardRoute role="patient" />}>
          <Route path="patient" element={<DashboardLayout />}>
            <Route index element={<PatientDashboardPage />} />
            <Route path="appointments" element={<PatientAppointmentsPage />} />
            <Route path="records" element={<PatientRecordsPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
