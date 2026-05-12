"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ChevronRight,
  ContactRound,
  Home,
} from "lucide-react";
import { UserSessionFooter } from "@/components/user-session-footer";

const SIDEBAR_STORAGE_KEY = "crm-sidebar-collapsed";

const menuItems = [
  {
    label: "Inicio",
    path: "/crm",
    icon: Home,
  },
  {
    label: "Leads",
    path: "/crm/leads",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    label: "Contatos / Empresas",
    path: "/crm/contatos",
    icon: ContactRound,
  },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (!savedState) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setSidebarCollapsed(savedState === "true");
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const nextState = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextState));
      return nextState;
    });
  };

  const isRouteActive = (path: string) =>
    path === "/crm" ? pathname === path : pathname.startsWith(path);

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
          width: 100%;
          border: none;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, justify-content 0.2s;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 12px;
          background: transparent;
          color: #fff;
          font: inherit;
          text-align: left;
        }

        .menu-item:hover {
          background: rgba(255,255,255,0.1);
        }

        .active {
          background: rgba(255,255,255,0.2);
        }

        .menu-item-collapsed {
          justify-content: center;
          padding-inline: 0;
        }

        .menu-label {
          overflow: hidden;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 0.18s ease;
        }
      `}</style>

      <div style={containerStyle}>
        <div
          style={{
            ...sidebarStyle,
            width: sidebarCollapsed ? "76px" : "260px",
            padding: sidebarCollapsed ? "18px 12px" : "20px",
          }}
        >
          <div
            style={{
              ...topBarStyle,
              justifyContent: sidebarCollapsed ? "center" : "space-between",
            }}
          >
            <button
              type="button"
              style={{
                ...brandStyle,
                width: sidebarCollapsed ? "38px" : "auto",
                height: sidebarCollapsed ? "38px" : "auto",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                fontSize: sidebarCollapsed ? "24px" : "22px",
                letterSpacing: sidebarCollapsed ? 0 : "2px",
              }}
              onClick={() => router.push("/home")}
              aria-label="Voltar para home"
              title={sidebarCollapsed ? "GLOBAL CRM" : undefined}
            >
              {sidebarCollapsed ? "G" : "GLOBAL CRM"}
            </button>

            {!sidebarCollapsed ? (
              <button
                type="button"
                style={toggleButtonStyle}
                onClick={handleToggleSidebar}
                aria-label="Recolher menu lateral"
                title="Recolher menu"
              >
                <ChevronLeft size={18} strokeWidth={2.2} />
              </button>
            ) : null}
          </div>

          {!sidebarCollapsed ? <div style={logoUnderline}></div> : null}

          {sidebarCollapsed ? (
            <button
              type="button"
              style={{ ...toggleButtonStyle, ...collapsedToggleStyle }}
              onClick={handleToggleSidebar}
              aria-label="Expandir menu lateral"
              title="Expandir menu"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          ) : null}

          <div style={menuContentStyle}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`menu-item ${active ? "active" : ""} ${
                    sidebarCollapsed ? "menu-item-collapsed" : ""
                  }`}
                  onClick={() => router.push(item.path)}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-label={item.label}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  {!sidebarCollapsed ? (
                    <span className="menu-label">{item.label}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <UserSessionFooter compact={sidebarCollapsed} />
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
  color: "#fff",
  backdropFilter: "blur(10px)",
  background: "rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100vh",
  boxSizing: "border-box",
  transition: "width 0.25s ease, padding 0.25s ease",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
};

const menuContentStyle: React.CSSProperties = {
  flex: 1,
  marginTop: "20px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const brandStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontWeight: "900",
  background: "linear-gradient(270deg, #60a5fa, #1e40af, #0ea5e9)",
  backgroundSize: "400% 400%",
  animation: "gradientMove 6s ease infinite, glowPulse 3s ease-in-out infinite",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
};

const logoUnderline: React.CSSProperties = {
  height: "3px",
  borderRadius: "10px",
  background: "linear-gradient(90deg, #60a5fa, transparent)",
  marginTop: "4px",
  width: "90px",
};

const toggleButtonStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  flexShrink: 0,
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const collapsedToggleStyle: React.CSSProperties = {
  alignSelf: "center",
  marginBottom: "4px",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: "40px",
  color: "#fff",
  minWidth: 0,
  overflow: "hidden",
};
