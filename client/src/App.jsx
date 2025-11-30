import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import TaskFormPage from "./pages/TaskFormPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";

import ProtectedRoute from "./ProtectedRoute";
import { TaskProvider } from "./context/TasksContext";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
             
             
             
                </Route>

                {/* Rutas con Navbar */}
                <Route element={<LayoutWithNavbar />}>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/add-task" element={<TaskFormPage />} />
                    <Route path="/tasks/:id" element={<TaskFormPage />} />
                    <Route path="/profile" element={<ProfilePage />} />



                  </Route>
                </Route>
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