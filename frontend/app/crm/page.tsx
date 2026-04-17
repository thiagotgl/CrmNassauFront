"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function CRMHome() {
  const router = useRouter();

  return (
    <div style={containerStyle}>
      
      <div style={contentBox}>
        <h1 style={titleStyle}>Bem-vindo ao GLOBAL CRM</h1>

        <p style={subtitleStyle}>
          Gerencie seus leads, negociações e contatos de forma inteligente.
        </p>

        <div style={cardsContainer}>
          <Card 
            title="Leads" 
            desc="Gerencie seus leads em Kanban"
            onClick={() => router.push("/crm/leads")}
          />
          <Card 
            title="Negociações" 
            desc="Acompanhe oportunidades"
            onClick={() => router.push("/crm/negociacoes")}
          />
          <Card 
            title="Contatos" 
            desc="Base de clientes e empresas"
            onClick={() => router.push("/crm/contatos")}
          />
        </div>
      </div>

    </div>
  );
}

/* ===== COMPONENTE CARD ===== */

function Card({ 
  title, 
  desc, 
  onClick 
}: { 
  title: string; 
  desc: string; 
  onClick?: () => void;
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <div 
      style={{
        ...cardStyle,
        transform: hover ? "scale(1.05)" : "scale(1)",
        boxShadow: hover
          ? "0 10px 30px rgba(0,0,0,0.3)"
          : "0 4px 15px rgba(0,0,0,0.15)",
        background: hover
          ? "rgba(255,255,255,0.18)"
          : "rgba(255,255,255,0.1)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        console.log("clicou no card:", title);
        onClick?.();
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>{title}</h3>
      <p style={{ opacity: 0.7, fontSize: "14px" }}>{desc}</p>
    </div>
  );
}

/* ===== ESTILOS ===== */

const containerStyle: React.CSSProperties = {
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const contentBox: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
};

const titleStyle: React.CSSProperties = {
  fontSize: "34px",
  marginBottom: "10px",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "18px",
  opacity: 0.8,
  marginBottom: "40px",
};

const cardsContainer: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "220px",
  padding: "24px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  cursor: "pointer",
  transition: "all 0.25s ease",
  border: "1px solid rgba(255,255,255,0.15)",
};