import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="top-bar">
      <h3>
        Hi,{" "}
        <span style={{ color: "#ffd700" }}>
          {user.name || "User"}
        </span>{" "}
        👋
      </h3>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
