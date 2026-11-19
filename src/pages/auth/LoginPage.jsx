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
      <div className="min-h-screen flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 p-8 rounded-lg w-96 space-y-4"
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

          <div className="text-right mt-3">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
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
