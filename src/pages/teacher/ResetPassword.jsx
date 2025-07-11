import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { LockIcon, LockKeyhole, LockKeyholeIcon } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `https://api.jsic.in/api/auth/reset-password/${token}`,
        { password }
      );
      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error("Token expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-xl rounded-lg">
      <ToastContainer />
      <div className="flex justify-center mb-4">
        <LockKeyholeIcon className="text-green-600 w-10 h-10" />
      </div>
      <h2 className="text-2xl font-semibold text-center mb-4">
        Reset Password
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full border border-gray-300 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
