import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const Authentication = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = checkCookies();
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const checkCookies = () => {
    const authSessionCookie = document.cookie.match("auth-session=([^;]+)");

    return !!authSessionCookie;
  };

  const handleAuth = async () => {
    const response = await fetch("http://localhost:5000/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const { url } = await response.json();
    setShowAuth(false);

    // Redirect to verification URL
    window.location.href = url;
  };

  const handleClose = () => {
    setShowAuth(false);
  };

  const handleButtonClick = () => {
    setShowAuth(true);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <main className="text-center">
        <h1 className="h3 mb-3 fw-normal">Welcome!</h1>
        <div className="text-center d-grid gap-2">
          <Button variant="primary" onClick={handleButtonClick} size="lg">
            Login
          </Button>
        </div>

        <Modal show={showAuth} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Log In</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <input
              className="form-control"
              type="text"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>

            <Button variant="primary" onClick={handleAuth}>
              Log In
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default Authentication;
