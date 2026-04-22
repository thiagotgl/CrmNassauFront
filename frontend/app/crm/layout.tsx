"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isConfigRoute = useMemo(
    () =>
      pathname === "/crm/config_user" ||
      pathname === "/crm/config_unidades",
    [pathname],
  );

  const [openConfig, setOpenConfig] = useState(isConfigRoute);

  const isLeadsRoute = pathname === "/crm/leads";
  const isConfigUserRoute = pathname === "/crm/config_user";
  const isConfigUnidadesRoute = pathname === "/crm/config_unidades";

  const configIsOpen = openConfig || isConfigRoute;

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
          transition: 0.2s;
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
        <div style={sidebarStyle}>
          <div style={logoContainer}>
            <h1 style={brandStyle}>GLOBAL CRM</h1>
            <div style={logoUnderline}></div>
          </div>

          <div style={sessionBoxStyle}>
            <div style={sessionEmailStyle}>
              {session?.user?.email ?? "Sessão autenticada"}
            </div>
            <button
              style={logoutStyle}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sair
            </button>
          </div>

          <div style={{ marginTop: "40px" }}>
            <div
              className={`menu-item ${isLeadsRoute ? "active" : ""}`}
              onClick={() => router.push("/crm/leads")}
            >
              <span>Leads</span>
            </div>

            <div
              className="menu-item"
              onClick={() => router.push("/crm/negociacoes")}
            >
              <span>Negociações</span>
            </div>

            <div
              className="menu-item"
              onClick={() => router.push("/crm/contatos")}
            >
              <span>Contatos / Empresas</span>
            </div>

            <div
              className="menu-item"
              onClick={() => router.push("/crm/dashboards")}
            >
              <span>Dashboards</span>
            </div>

            <div>
              <div
                className={`menu-item ${isConfigRoute ? "active" : ""}`}
                onClick={() => setOpenConfig((current) => !current)}
              >
                <span>Configurações</span>

                <span className={`arrow ${configIsOpen ? "open" : ""}`}>
                  ▼
                </span>
              </div>

              <div className={`submenu ${configIsOpen ? "open" : ""}`}>
                <div
                  className={`submenu-item ${isConfigUserRoute ? "active" : ""}`}
                  onClick={() => router.push("/crm/config_user")}
                >
                  Cadastro de Usuários
                </div>

                <div
                  className={`submenu-item ${isConfigUnidadesRoute ? "active" : ""}`}
                  onClick={() => router.push("/crm/config_unidades")}
                >
                  Cadastro de Unidades
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={contentStyle}>{children}</div>
      </div>
    </>
  );
}

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

const sessionBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "24px",
};

const sessionEmailStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#cbd5e1",
  wordBreak: "break-word",
};

const logoutStyle: React.CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
  padding: "10px 14px",
};
