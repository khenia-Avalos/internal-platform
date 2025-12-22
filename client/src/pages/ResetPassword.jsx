import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function ResetPassword() {
  const [resetToken, setResetToken] = useState("");
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm();

  const password = watch("password"); // Para validar confirmPassword

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      const decodedToken = decodeURIComponent(token);
      const cleanToken = decodedToken.replace(/['"]/g, "").trim();
      setResetToken(cleanToken);
    } else {
      setApiError("No token provided in URL");
    }
  }, [location.search]);

  const goToLogin = () => {
    navigate("/login");
  };

  const onSubmit = async (data) => {
    setApiError("");

    if (!resetToken) {
      setApiError("No reset token available.");
      return;
    }

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/reset-password`, {
        token: resetToken,
        password: data.password,
      });

      if (
        response.data.success ||
        (Array.isArray(response.data) &&
          response.data.includes("Password reset successfully"))
      ) {
        setSuccess(true);
        reset(); // Limpia el formulario
      } else {
        setApiError(
          response.data?.[0] || response.data?.message || "Unknown error"
        );
      }
    } catch (error) {
      if (error.response) {
        const serverError =
          error.response.data?.[0] ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        setApiError(" " + serverError);
      } else if (error.request) {
        setApiError(
          " Cannot connect to server. Check your internet connection."
        );
      } else {
        setApiError(" Error: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
   <div className="bg-white max-w-md w-full p-6 rounded-md shadow-md">

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
        </div>


        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-green-800 mb-3">
               Password Reset Successful!
            </h3>
            <p className="text-green-700 mb-6">
              Your password has been updated successfully.
            </p>
            <button
              onClick={goToLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Login
            </button>
          </div>
        )}

    
        {apiError && !success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{apiError}</p>
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm disabled:opacity-50"
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm disabled:opacity-50"
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={goToLogin}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
