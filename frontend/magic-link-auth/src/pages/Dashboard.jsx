import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookies = async () => {
      const authSessionCookie = document.cookie.match("auth-session=([^;]+)");

      if (!authSessionCookie) {
        navigate("/login");
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
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    document.cookie = `auth-session=; max-age=0`;
    navigate("/login");
  };

  return (
    <div className="mainContainer">
      <div className={"titleContainer"}>
        <div>Welcome!</div>
      </div>
      <div className={"buttonContainer"}>
        <div>You're logged in as {userEmail}!</div>
        <input
          className={"inputButton"}
          type="button"
          onClick={handleLogout}
          value={"Log Out"}
        />
      </div>
    </div>
  );
};

export default Dashboard;
