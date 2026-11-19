import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthBackground from "../../components/AuthBackground";
import PasswordInput from "../../components/PasswordInput";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      return alert("Please enter your name.");
    }

    if (!formData.email.trim()) {
      return alert("Please enter your email.");
    }

    if (!formData.password) {
      return alert("Please enter a password.");
    }

    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match.");
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "student"
      });

      alert(res.data.message);

      resetForm();

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <div className="flex items-center justify-center min-h-screen ">
        <div className="bg-white/0 shadow-lg rounded-lg p-8 w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
            Student Registration
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              name="name"
              placeholder="Full Name"
              className="w-full border rounded p-2"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border rounded p-2"
              value={formData.email}
              onChange={handleChange}
            />

            <PasswordInput
              name="password"
              placeholder="Password"
              className="w-full border rounded p-2"
              value={formData.password}
              onChange={handleChange}
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full border rounded p-2"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full border border-gray-400 hover:bg-gray-100 p-2 rounded"
            >
              Back to Login
            </button>

          </form>
        </div>
      </div>
    </AuthBackground>
  );
}

export default RegisterPage;
