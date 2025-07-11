import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("https://api.jsic.in/api/auth/forgot-password", {
        email,
      });
      toast.success("Reset link sent. Please check your inbox.");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-xl rounded-lg">
      <ToastContainer />
      <div className="flex justify-center mb-4">
        <MailCheck className="text-blue-600 w-10 h-10" />
      </div>
      <h2 className="text-2xl font-semibold text-center mb-4">
        Forgot Password
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
