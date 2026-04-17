"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConfigUnidadesPage() {
  const pathname = usePathname();

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Cadastro de Unidades</h1>

      <p style={descriptionStyle}>
        Esta área será usada para gerenciar as unidades do CRM.
      </p>

      <Link href="/crm/config_unidades" style={linkStyle}>
        <div
          className={`submenu-item ${
            pathname === "/crm/config_unidades" ? "active" : ""
          }`}
          style={{
            ...itemStyle,
            ...(pathname === "/crm/config_unidades" ? activeItemStyle : {}),
          }}
        >
          Cadastro de Unidades
        </div>
      </Link>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  color: "#fff",
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  marginBottom: "12px",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "16px",
  opacity: 0.85,
  marginBottom: "24px",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
};

const itemStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: "8px",
  color: "#fff",
  background: "rgba(255,255,255,0.08)",
};

const activeItemStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.2)",
};
