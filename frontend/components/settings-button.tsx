"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Settings, X } from "lucide-react";
import { UserRegistrationForm } from "@/components/user-registration-form";

export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        style={iconButtonStyle}
        onClick={() => setOpen(true)}
        aria-label="Configuracoes"
        title="Configuracoes"
      >
        <Settings size={18} strokeWidth={2.2} />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div style={overlayStyle} role="dialog" aria-modal="true">
              <button
                type="button"
                style={backdropStyle}
                onClick={() => setOpen(false)}
                aria-label="Fechar configuracoes"
              />

              <div style={windowStyle}>
                <div style={headerStyle}>
                  <div style={tabsStyle}>
                    <button type="button" style={activeTabStyle}>
                      Cadastro de usuario
                    </button>
                  </div>

                  <button
                    type="button"
                    style={closeButtonStyle}
                    onClick={() => setOpen(false)}
                    aria-label="Fechar"
                    title="Fechar"
                  >
                    <X size={18} strokeWidth={2.2} />
                  </button>
                </div>

                <div style={contentStyle}>
                  <UserRegistrationForm />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export const iconButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
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

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  border: "none",
  background: "rgba(2,6,23,0.48)",
  backdropFilter: "blur(8px)",
  cursor: "default",
};

const windowStyle: CSSProperties = {
  position: "relative",
  width: "min(760px, calc(100vw - 48px))",
  maxHeight: "calc(100vh - 48px)",
  overflow: "auto",
  borderRadius: "8px",
  background: "#fff",
  boxShadow: "0 24px 80px rgba(0,0,0,0.36)",
};

const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
};

const tabsStyle: CSSProperties = {
  display: "flex",
  padding: "10px 12px 0",
};

const activeTabStyle: CSSProperties = {
  border: "none",
  borderBottom: "2px solid #2563eb",
  background: "transparent",
  color: "#111827",
  padding: "12px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const closeButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  marginRight: "12px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const contentStyle: CSSProperties = {
  padding: "30px",
};
