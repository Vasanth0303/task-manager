import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";

/* ✅ Gmail validation */
const isValidGmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* ✅ Email check */
    if (!isValidGmail(email)) {
      toast.error("Only @gmail.com email is allowed");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        password
      });

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card slide-up" onSubmit={submit}>
        <h2>Create Account 🚀</h2>
        <br />

        <div className="field">
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <label>Name</label>
        </div>

        <div className="field">
          <input
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
            title="Only Gmail addresses are allowed"
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
          Register
        </button>

        <p className="switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
