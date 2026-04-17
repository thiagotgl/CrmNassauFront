"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [openConfig, setOpenConfig] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

        .submenu {
          margin-left: 15px;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }

        .submenu.open {
          max-height: 200px;
          opacity: 1;
          transform: translateY(0);
        }

        .submenu-item {
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        .submenu-item:hover {
          background: rgba(255,255,255,0.1);
        }

        .arrow {
          opacity: 0;
          transition: all 0.3s ease;
          font-size: 12px;
        }

        .menu-item:hover .arrow {
          opacity: 1;
        }

        .arrow.open {
          transform: rotate(180deg);
          opacity: 1;
        }
      `}</style>

      <div style={containerStyle}>
        
        {/* SIDEBAR */}
        <div style={sidebarStyle}>
          <div style={logoContainer}>
            <h1 style={brandStyle}>GLOBAL CRM</h1>
            <div style={logoUnderline}></div>
          </div>

          <div style={{ marginTop: "40px" }}>
            
            {/* Leads */}
            <div
              className={`menu-item ${pathname === "/crm/leads" ? "active" : ""}`}
              onClick={() => router.push("/crm/leads")}
            >
              <span>Leads</span>
            </div>

            {/* Negociações */}
            <div
              className="menu-item"
              onClick={() => router.push("/crm/negociacoes")}
            >
              <span>Negociações</span>
            </div>

            {/* Contatos */}
            <div
              className="menu-item"
              onClick={() => router.push("/crm/contatos")}
            >
              <span>Contatos / Empresas</span>
            </div>

            {/* Dashboards */}
            <div
              className="menu-item"
              onClick={() => router.push("/crm/dashboards")}
            >
              <span>Dashboards</span>
            </div>

            {/* CONFIG */}
            <div>
              <div
                className="menu-item"
                onClick={() => setOpenConfig(!openConfig)}
              >
                <span>Configurações</span>

                <span className={`arrow ${openConfig ? "open" : ""}`}>
                  ▼
                </span>
              </div>

              <div className={`submenu ${openConfig ? "open" : ""}`}>
                <div
                  className="submenu-item"
                  onClick={() => router.push("/crm/config_user")}
                >
                  Cadastro de Usuários
                </div>

                <div
                  className="submenu-item"
                  onClick={() => router.push("/crm/config_unidades")}
                >
                  Cadastro de Unidades
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </>
  );
}

/* ===== ESTILOS ===== */

const containerStyle: React.CSSProperties = {
  display: "flex",
  height: "100vh",
  fontFamily: "Poppins, sans-serif",
  background: "linear-gradient(270deg, #1e293b, #1e40af, #0f172a)",
};

const sidebarStyle: React.CSSProperties = {
  width: "260px",
  padding: "20px",
  color: "#fff",
  backdropFilter: "blur(10px)",
  background: "rgba(0,0,0,0.2)",
};

const logoContainer: React.CSSProperties = {
  marginBottom: "20px",
};

const brandStyle: React.CSSProperties = {
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
};