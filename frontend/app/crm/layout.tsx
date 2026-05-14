"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  Building2,
  ChevronLeft,
  ChevronRight,
  ContactRound,
} from "lucide-react";
import { UserSessionFooter } from "@/components/user-session-footer";

const SIDEBAR_STORAGE_KEY = "crm-sidebar-collapsed";

const menuItems = [
  {
    label: "Leads",
    path: "/crm/leads",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    label: "Empresas",
    path: "/crm/empresas",
    icon: Building2,
  },
  {
    label: "Contatos",
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
        .menu-item {
          width: 100%;
          border: none;
          min-height: var(--crm-control-height-md);
          padding: 0 var(--crm-space-3);
          border-radius: var(--crm-radius-md);
          cursor: pointer;
          transition: background 0.2s, color 0.2s, justify-content 0.2s;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: var(--crm-space-2);
          background: transparent;
          color: rgba(255,255,255,0.82);
          font: inherit;
          font-size: 0.93rem;
          font-weight: 600;
          text-align: left;
        }

        .menu-item:hover {
          background: rgba(255,255,255,0.12);
          color: #ffffff;
        }

        .active {
          background: rgba(255,255,255,0.18);
          color: #ffffff;
          box-shadow: inset 3px 0 0 var(--crm-brand-orange);
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
            width: sidebarCollapsed
              ? "var(--crm-sidebar-collapsed-width)"
              : "var(--crm-sidebar-width)",
            padding: sidebarCollapsed
              ? "var(--crm-space-4) var(--crm-space-2)"
              : "var(--crm-space-4)",
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
                width: sidebarCollapsed ? "2.25rem" : "auto",
                height: sidebarCollapsed ? "2.25rem" : "auto",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                fontSize: sidebarCollapsed ? "1.35rem" : "1.2rem",
                letterSpacing: sidebarCollapsed ? 0 : "0.08rem",
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
                  <Icon size={18} strokeWidth={2.2} />
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
  height: "100dvh",
  overflow: "hidden",
  fontFamily: "var(--crm-font-family)",
  background:
    "linear-gradient(135deg, var(--crm-brand-navy) 0%, var(--crm-brand-primary) 48%, var(--crm-brand-cyan) 100%)",
};

const sidebarStyle: React.CSSProperties = {
  color: "#fff",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(30,64,175,0.92) 100%)",
  borderRight: "1px solid rgba(255,255,255,0.18)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100vh",
  boxSizing: "border-box",
  transition: "width 0.25s ease, padding 0.25s ease",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--crm-space-2)",
  marginBottom: "var(--crm-space-3)",
};

const menuContentStyle: React.CSSProperties = {
  flex: 1,
  marginTop: "var(--crm-space-3)",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-1)",
};

const brandStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontWeight: "900",
  color: "#fff",
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
};

const logoUnderline: React.CSSProperties = {
  height: "2px",
  borderRadius: "10px",
  background: "linear-gradient(90deg, var(--crm-brand-orange), rgba(255,255,255,0.35))",
  marginTop: "var(--crm-space-1)",
  width: "5rem",
};

const toggleButtonStyle: React.CSSProperties = {
  width: "var(--crm-control-height-md)",
  height: "var(--crm-control-height-md)",
  flexShrink: 0,
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const collapsedToggleStyle: React.CSSProperties = {
  alignSelf: "center",
  marginBottom: "var(--crm-space-1)",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: "var(--crm-page-padding)",
  color: "#fff",
  minWidth: 0,
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.08) 0%, rgba(30,64,175,0.2) 100%)",
};
