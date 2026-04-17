"use client";

import { useState } from "react";

/* ===== TIPOS ===== */

type UsuarioForm = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  tipo: string;
  ativo: boolean;
};

/* ===== COMPONENTE PRINCIPAL ===== */

export default function CadastroUsuarioPage() {
  const [form, setForm] = useState<UsuarioForm>({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    tipo: "USUARIO",
    ativo: true,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    // simulação de API
    setTimeout(() => {
      setLoading(false);
      setToast("Usuário cadastrado com sucesso!");
      setTimeout(() => setToast(null), 3000);
    }, 1200);
  }

  return (
    <div style={container}>
      {toast && <div style={toastStyle}>{toast}</div>}

      <div style={card}>
        <h1 style={title}>Cadastro de Usuários</h1>
        <p style={subtitle}>
          Preencha os dados para criar um novo usuário
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={grid}>
            <Input
              label="Nome"
              value={form.nome}
              onChange={(v) => setForm({ ...form, nome: v })}
            />

            <Input
              label="CPF"
              value={form.cpf}
              onChange={(v) => setForm({ ...form, cpf: v })}
            />

            <Input
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            <Input
              label="Senha"
              type="password"
              value={form.senha}
              onChange={(v) => setForm({ ...form, senha: v })}
            />

            <Select
              label="Tipo de usuário"
              value={form.tipo}
              onChange={(v) => setForm({ ...form, tipo: v })}
              options={[
                { label: "Usuário", value: "USUARIO" },
                { label: "Administrador", value: "ADMIN" },
              ]}
            />
          </div>

          <div style={switchRow}>
            <Toggle
              label="Usuário ativo"
              checked={form.ativo}
              onChange={(v) => setForm({ ...form, ativo: v })}
            />
          </div>

          <button
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Cadastrar usuário"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== COMPONENTES ===== */

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function Input({ label, value, onChange, type = "text" }: InputProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div style={field}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          ...input,
          border: focus ? "1px solid #2563eb" : input.border,
          boxShadow: focus ? "0 0 0 2px rgba(37,99,235,0.2)" : "none",
        }}
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div style={field}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label style={toggleContainer}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

/* ===== ESTILOS ===== */

const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "40px",
  minHeight: "100vh",
};

const card: React.CSSProperties = {
  width: "720px",
  padding: "30px",
  borderRadius: "16px",
  background: "#ffffff",
  boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
};

const title: React.CSSProperties = {
  fontSize: "26px",
  marginBottom: "5px",
  color: "#111",
};

const subtitle: React.CSSProperties = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "25px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#555",
};

const input: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  background: "#fff",
  color: "#111",
  outline: "none",
  transition: "0.2s",
};

const switchRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const toggleContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  fontSize: "14px",
  color: "#333",
};

const button: React.CSSProperties = {
  marginTop: "10px",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  transition: "0.2s",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "#22c55e",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "8px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
};