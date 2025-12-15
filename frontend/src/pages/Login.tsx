import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password
      });

      // Backend returns ONLY token
      localStorage.setItem("token", res.data.token);

      // Create safe user object from email
      localStorage.setItem(
        "user",
        JSON.stringify({ name: email.split("@")[0] })
      );

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Invalid credentials"
      );
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card slide-up" onSubmit={submit}>
        <h2>Welcome Back 👋</h2>

        <br />

        <div className="field">
          <input
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>

        <div className="field">
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>

        <button type="submit" className="primary-btn">
          Login
        </button>

        <p className="switch">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
