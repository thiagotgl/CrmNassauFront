"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { signOut, useSession } from "next-auth/react";

export default function Hub() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glowPulse {
          0% { text-shadow: 0 0 10px rgba(59,130,246,0.2); }
          50% { text-shadow: 0 0 25px rgba(59,130,246,0.6); }
          100% { text-shadow: 0 0 10px rgba(59,130,246,0.2); }
        }

        .cards-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 100px;
          width: 100%;
          max-width: 1200px;
        }

        .card {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }

        /* todos recuam */
        .cards-container:hover .card {
          transform: scale(0.9);
          opacity: 0.5;
        }

        /* foco principal */
        .cards-container .card:hover {
          transform: scale(1.2);
          opacity: 1;
          box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }
      `}</style>

      <div style={containerStyle}>
        {/* LOGO */}
        <div style={logoContainer}>
          <h1 style={brandStyle}>GLOBAL CRM</h1>
          <div style={logoUnderline}></div>
        </div>

        <div style={userPanelStyle}>
          <span style={userTextStyle}>
            {session?.user?.email ?? "Sessão ativa"}
          </span>
          <button
            style={logoutButtonStyle}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair
          </button>
        </div>

        <h1 style={titleStyle}>Escolha um sistema</h1>

        <div className="cards-container">
          <div
            style={cardStyle}
            className="card"
            onClick={() => router.push("/crm")}
          >
            <span style={iconStyle}>📊</span>
            <span>CRM</span>
          </div>

          <div
            style={cardStyle}
            className="card"
            onClick={() => router.push("/task")}
          >
            <span style={iconStyle}>✅</span>
            <span>Task</span>
          </div>

          <div
            style={cardStyle}
            className="card"
            onClick={() => router.push("/desk")}
          >
            <span style={iconStyle}>👩🏽‍💻</span>
            <span>Desk</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== ESTILOS ===== */

const containerStyle: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(270deg, #1e293b, #1e40af, #0f172a)",
  fontFamily: "Poppins, sans-serif",
  position: "relative",
};

const logoContainer: React.CSSProperties = {
  position: "absolute",
  top: "30px",
  left: "30px",
};

const brandStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: "900",
  letterSpacing: "3px",
  background: "linear-gradient(270deg, #60a5fa, #1e40af, #0ea5e9)",
  backgroundSize: "400% 400%",
  animation: "gradientMove 6s ease infinite, glowPulse 3s ease-in-out infinite",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const logoUnderline: React.CSSProperties = {
  height: "4px",
  borderRadius: "10px",
  background: "linear-gradient(90deg, #60a5fa, transparent)",
  marginTop: "6px",
  width: "110px",
};

const titleStyle: React.CSSProperties = {
  color: "#fff",
  marginBottom: "60px",
  fontSize: "34px",
  fontWeight: "600",
};

const userPanelStyle: React.CSSProperties = {
  position: "absolute",
  top: "30px",
  right: "30px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const userTextStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "14px",
};

const logoutButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  borderRadius: "999px",
  padding: "10px 16px",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  width: "280px",
  height: "190px",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "22px",
  fontWeight: "600",
  color: "#ffffff",
  cursor: "pointer",
};

const iconStyle: React.CSSProperties = {
  fontSize: "50px",
  marginBottom: "15px",
};
