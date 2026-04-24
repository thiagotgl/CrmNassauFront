"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useSession } from "next-auth/react";

type UsuarioTipo = "admin" | "vendedor" | "cliente" | "supervisor";

type UsuarioForm = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  tipo: UsuarioTipo;
};

const tiposPermitidos: UsuarioTipo[] = [
  "admin",
  "vendedor",
  "cliente",
  "supervisor",
];

function validateForm(form: UsuarioForm) {
  const nome = form.nome.trim();
  const cpf = form.cpf.replace(/\D/g, "");
  const email = form.email.trim();
  const senha = form.senha;

  if (!nome) {
    return "Informe o nome do usuario.";
  }

  if (cpf.length !== 11) {
    return "CPF deve conter exatamente 11 digitos.";
  }

  if (!email) {
    return "Informe o email do usuario.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um email valido.";
  }

  if (senha.length < 6) {
    return "Senha deve conter no minimo 6 caracteres.";
  }

  if (!tiposPermitidos.includes(form.tipo)) {
    return "Tipo de usuario invalido.";
  }

  return null;
}

export function UserRegistrationForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState<UsuarioForm>({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    tipo: "vendedor",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setToast(null);

    try {
      const validationError = validateForm(form);

      if (validationError) {
        throw new Error(validationError);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          cpf: form.cpf.replace(/\D/g, ""),
          email: form.email.trim(),
          senha: form.senha,
          tipo: form.tipo,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao cadastrar usuario.");
      }

      setForm({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
        tipo: "vendedor",
      });
      setToast("Usuario cadastrado com sucesso!");
      setTimeout(() => setToast(null), 3000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar usuario.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toast ? <div style={toastStyle}>{toast}</div> : null}

      <div>
        <h1 style={title}>Cadastro de Usuarios</h1>
        <p style={subtitle}>Preencha os dados para criar um novo usuario</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={grid}>
            <Input
              label="Nome"
              value={form.nome}
              onChange={(value) => setForm({ ...form, nome: value })}
              required
            />

            <Input
              label="CPF"
              value={form.cpf}
              onChange={(value) =>
                setForm({ ...form, cpf: value.replace(/\D/g, "").slice(0, 11) })
              }
              inputMode="numeric"
              maxLength={11}
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              required
            />

            <Input
              label="Senha"
              type="password"
              value={form.senha}
              onChange={(value) => setForm({ ...form, senha: value })}
              minLength={6}
              required
            />

            <Select
              label="Tipo de usuario"
              value={form.tipo}
              onChange={(value) =>
                setForm({ ...form, tipo: value as UsuarioTipo })
              }
              options={[
                { label: "Vendedor", value: "vendedor" },
                { label: "Admin", value: "admin" },
                { label: "Cliente", value: "cliente" },
                { label: "Supervisor", value: "supervisor" },
              ]}
            />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <button
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Cadastrar usuario"}
          </button>
        </form>
      </div>
    </>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  minLength?: number;
  required?: boolean;
};

function Input({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  minLength,
  required,
}: InputProps) {
  const [focus, setFocus] = useState(false);

  return (
    <div style={field}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        style={input}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const title: CSSProperties = {
  fontSize: "26px",
  marginBottom: "5px",
  color: "#111",
};

const subtitle: CSSProperties = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "25px",
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const field: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#555",
};

const input: CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  background: "#fff",
  color: "#111",
  outline: "none",
  transition: "0.2s",
};

const button: CSSProperties = {
  marginTop: "10px",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  transition: "0.2s",
};

const errorStyle: CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "13px",
};

const toastStyle: CSSProperties = {
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "#22c55e",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "8px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  zIndex: 60,
};
