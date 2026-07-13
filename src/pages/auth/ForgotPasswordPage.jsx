import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AuthBackground from "../../components/AuthBackground";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/request-password-reset",
        {
          email
        }
      );

      alert(res.data.message);

      setEmail("");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="min-h-screen flex items-center justify-center">

        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
            Forgot Password
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Enter your registered email.
            <br />
            Admin will reset your password manually.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
            >
              {loading
                ? "Submitting..."
                : "Request Password Reset"}
            </button>

          </form>

          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Back to Login
            </Link>

          </div>

        </div>

      </div>
    </AuthBackground>
  );
}

export default ForgotPasswordPage;