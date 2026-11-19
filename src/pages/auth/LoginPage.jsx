import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import AuthBackground from "../../components/AuthBackground";
import PasswordInput from "../../components/PasswordInput";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      const user = res.data.user;

      alert("Login successful");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <div className="min-h-screen flex justify-center items-center px-4 py-16 sm:py-0">
        <form
          onSubmit={handleSubmit}
          className="-translate-y-10 w-full max-w-sm space-y-4 rounded-lg bg-white/10 p-6 sm:translate-y-0 sm:p-8"
        >
          <h1 className="text-2xl font-bold">
            Login
          </h1>

          <input
            name="email"
            placeholder="Email"
            className="w-full border p-2"
            onChange={handleChange}
          />

          <PasswordInput
            name="password"
            placeholder="Password"
            className="w-full border p-2"
            onChange={handleChange}
          />

          <button disabled={isSubmitting} aria-busy={isSubmitting} className="w-full bg-blue-600 text-white p-2 rounded disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          <div className="text-left">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-12 text-center sm:mt-8">
            <p className="text-sm text-gray-700 sm:text-gray-600">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Register Here
            </button>
          </div>
        </form>
      </div>
    </AuthBackground>
  );
}

export default LoginPage;
