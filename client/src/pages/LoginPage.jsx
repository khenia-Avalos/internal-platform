import { useForm } from "react-hook-form";
import { useAuth } from "../context/authContext";
import { Link } from "react-router";
import { useState } from "react";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signin, errors: signinErrors } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoggingIn, setIsloggingIn] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setIsloggingIn(true);
    const result = await signin(data);

    setIsloggingIn(false);

    if (result.ok && result.data?.accessToken) {
      localStorage.setItem("token", result.data.accessToken);
      sessionStorage.setItem("token", result.data.accessToken);

      // Pequeño delay para evitar flash
      setTimeout(() => {
        window.location.href = "/tasks";
      }, 100);
    }
  });

  // ✅ MUY IMPORTANTE: Añade esto ANTES del return principal
  if (isLoggingIn) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Logging in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <div className="bg-white max-w-md w-full p-10 rounded-md shadow-md">
        {signinErrors.map((error, i) => (
          <div className="bg-red-500 p-2 text-white text-center mb-2" key={i}>
            {error}
          </div>
        ))}

        <h1 className="text-2xl font-bold text-cyan-600 text-center mb-6">
          Clinica Veterinaria
        </h1>

        <form onSubmit={onSubmit}>
          {/* Email */}
          <h1 className="text-sm font-semibold text-black text-left">Email</h1>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full bg-white text-zinc-700 px-4 py-2 rounded-md my-2 border border-cyan-400"
            placeholder="Email"
            disabled={isLoggingIn}
          />
          {errors.email && <p className="text-red-500">Email is required</p>}

          {/* Password */}
          <h1 className="text-sm font-semibold text-black text-left mt-4">
            Password
          </h1>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              {...register("password", { required: true })}
              className="w-full bg-white text-zinc-700 px-4 py-2 rounded-md my-2 border border-cyan-400"
              placeholder="Password"
              disabled={isLoggingIn}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => !isLoggingIn && setShowPwd(!showPwd)} // ✅ Solo si no está cargando
            >
              {showPwd ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#06b6d4"
                  className="w-5 h-5"
                >
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path
                    fillRule="evenodd"
                    d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#06b6d4"
                  className="w-5 h-5"
                >
                  <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                  <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                  <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                </svg>
              )}
            </div>
          </div>
          {errors.password && (
            <p className="text-red-500">Password is required</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700 transition mt-4"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 mb-3">Don't have an account?</p>

          <Link
            to="/register"
            className="inline-block bg-white text-cyan-600 border border-cyan-600 px-4 py-1 rounded-md hover:bg-cyan-50 transition"
          >
            Sign Up
          </Link>
          <div className="w-full h-px bg-gray-300 my-3"></div>

          <Link
            to="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
