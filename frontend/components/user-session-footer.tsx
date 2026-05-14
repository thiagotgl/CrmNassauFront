"use client";

import type { CSSProperties } from "react";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SettingsButton, iconButtonStyle } from "@/components/settings-button";

export function UserSessionFooter({ compact = false }: { compact?: boolean }) {
  const { data: session } = useSession();

  return (
    <div
      style={{
        ...containerStyle,
        justifyContent: compact ? "center" : "space-between",
      }}
    >
      {!compact ? (
        <div style={emailStyle}>
          {session?.user?.email ?? "Sessao autenticada"}
        </div>
      ) : null}

      <div
        style={{
          ...actionsStyle,
          flexDirection: compact ? "column" : "row",
        }}
      >
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
  gap: "var(--crm-space-2)",
  paddingTop: "var(--crm-space-3)",
  borderTop: "1px solid rgba(255,255,255,0.12)",
};

const emailStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
  fontSize: "0.86rem",
  color: "rgba(255,255,255,0.72)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: "var(--crm-space-2)",
};
