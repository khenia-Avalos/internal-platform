import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/authContext";
import { AuthPage } from "./pages/AuthPage"; 

import TasksPage from "./pages/TasksPage";
import TaskFormPage from "./pages/TaskFormPage";
import HomePage from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";  // ← CORRECTO (importación con nombre)
import ProtectedRoute from "./ProtectedRoute";
import { TaskProvider } from "./context/TasksContext";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router";
import ClienteDetallePage from './pages/Dashboard/ClienteDetallePage';
import ClienteTemporalDetallePage from './pages/Dashboard/ClienteTemporalDetallePage';

import PacienteDetallePage from './pages/Dashboard/PacienteDetallePage';
import DoctorDetallePage from './pages/Dashboard/DoctorDetallePage.jsx';
import CitaDetallePage from "./pages/Dashboard/CitaDetallePage";
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword"; 

function App() {
  
  return (
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
            {/* QUITAR container y px-10 para que el dashboard ocupe toda la pantalla */}
            <main className="min-h-screen">
              <Routes>
                {/* Rutas sin Navbar */}
                <Route element={<LayoutWithoutNavbar />}>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Rutas con Navbar */}
                <Route element={<LayoutWithNavbar />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Rutas protegidas */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/add-task" element={<TaskFormPage />} />
                    <Route path="/tasks/:id" element={<TaskFormPage />} />
                    <Route path="/clientes/:id" element={<ClienteDetallePage />} /> 
                    <Route path="/citas/:id" element={<CitaDetallePage />} /> 
                    <Route path="/pacientes/:id" element={<PacienteDetallePage />} />
                    <Route path="/doctores/:id" element={<DoctorDetallePage />} /> 
                  </Route>
                </Route>
                
                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </BrowserRouter>
        </TaskProvider>
      </AuthProvider>
  );
}

/* Layout sin navbar */
function LayoutWithoutNavbar() {
  return (
    <>
      <Outlet />
    </>
  );
}

/* Layout con navbar */
function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;