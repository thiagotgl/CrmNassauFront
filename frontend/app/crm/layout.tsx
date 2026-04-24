"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserSessionFooter } from "@/components/user-session-footer";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLeadsRoute = pathname === "/crm/leads";

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

        .menu-item {
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .menu-item:hover {
          background: rgba(255,255,255,0.1);
        }

        .active {
          background: rgba(255,255,255,0.2);
        }
      `}</style>

      <div style={containerStyle}>
        <div style={sidebarStyle}>
          <div style={logoContainer}>
            <button
              type="button"
              style={brandStyle}
              onClick={() => router.push("/home")}
            >
              GLOBAL CRM
            </button>
            <div style={logoUnderline}></div>
          </div>

          <div style={menuContentStyle}>
            <div
              className={`menu-item ${isLeadsRoute ? "active" : ""}`}
              onClick={() => router.push("/crm/leads")}
            >
              <span>Leads</span>
            </div>

            <div className="menu-item">
              <span>Negociacoes</span>
            </div>

            <div className="menu-item">
              <span>Contatos / Empresas</span>
            </div>

            <div className="menu-item">
              <span>Dashboards</span>
            </div>
          </div>

          <UserSessionFooter />
        </div>

        <div style={contentStyle}>{children}</div>
      </div>
    </>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  height: "100vh",
  overflow: "hidden",
  fontFamily: "Poppins, sans-serif",
  background: "linear-gradient(270deg, #1e293b, #1e40af, #0f172a)",
};

const sidebarStyle: React.CSSProperties = {
  width: "260px",
  padding: "20px",
  color: "#fff",
  backdropFilter: "blur(10px)",
  background: "rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100vh",
  boxSizing: "border-box",
};

const logoContainer: React.CSSProperties = {
  marginBottom: "20px",
};

const menuContentStyle: React.CSSProperties = {
  flex: 1,
  marginTop: "20px",
  overflowY: "auto",
};

const brandStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: "22px",
  fontWeight: "900",
  letterSpacing: "2px",
  background: "linear-gradient(270deg, #60a5fa, #1e40af, #0ea5e9)",
  backgroundSize: "400% 400%",
  animation: "gradientMove 6s ease infinite, glowPulse 3s ease-in-out infinite",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const logoUnderline: React.CSSProperties = {
  height: "3px",
  borderRadius: "10px",
  background: "linear-gradient(90deg, #60a5fa, transparent)",
  marginTop: "4px",
  width: "90px",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: "40px",
  color: "#fff",
  minWidth: 0,
  overflow: "hidden",
};
