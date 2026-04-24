"use client";

import type { CSSProperties } from "react";
import { UserRegistrationForm } from "@/components/user-registration-form";

export default function CadastroUsuarioPage() {
  return (
    <div style={container}>
      <div style={card}>
        <UserRegistrationForm />
      </div>
    </div>
  );
}

const container: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "40px",
  minHeight: "100vh",
};

const card: CSSProperties = {
  width: "720px",
  padding: "30px",
  borderRadius: "16px",
  background: "#ffffff",
  boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
};
