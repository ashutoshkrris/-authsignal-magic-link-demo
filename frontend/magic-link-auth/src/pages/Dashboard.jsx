import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookies = async () => {
      const authSessionCookie = document.cookie.match("auth-session=([^;]+)");

      if (!authSessionCookie) {
        navigate("/auth");
        return false;
      }

      return true;
    };

    const fetchData = async () => {
      const cookiesValid = await checkCookies();
      if (!cookiesValid) return;

      try {
        const response = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        navigate("/auth");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    document.cookie = `auth-session=; max-age=0`;
    navigate("/auth");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <main className="px-3 text-center">
        <h1>Welcome Home!</h1>
        <p className="lead">You're logged in as {userEmail}!</p>
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-lg btn-dark fw-bold border-white bg-dark"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;