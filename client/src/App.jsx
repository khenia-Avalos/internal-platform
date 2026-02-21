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

import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword"; 

function App() {
  
  return (
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
            <main className="container mx-auto px-10">
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
                  
                  {/* 👇 NUEVA RUTA DASHBOARD CON NAVBAR */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Rutas protegidas para usuarios autenticados */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/add-task" element={<TaskFormPage />} />
                    <Route path="/tasks/:id" element={<TaskFormPage />} />
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