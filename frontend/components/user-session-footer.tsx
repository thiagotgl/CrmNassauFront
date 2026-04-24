"use client";

import type { CSSProperties } from "react";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SettingsButton, iconButtonStyle } from "@/components/settings-button";

export function UserSessionFooter() {
  const { data: session } = useSession();

  return (
    <div style={containerStyle}>
      <div style={emailStyle}>
        {session?.user?.email ?? "Sessao autenticada"}
      </div>

      <div style={actionsStyle}>
        <SettingsButton />

        <button
          type="button"
          style={iconButtonStyle}
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sair"
          title="Sair"
        >
          <LogOut size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  paddingTop: "18px",
  borderTop: "1px solid rgba(255,255,255,0.12)",
};

const emailStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
  fontSize: "13px",
  color: "#cbd5e1",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
};
