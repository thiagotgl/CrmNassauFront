"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { ArrowLeft, Copy, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Empresa = {
  id: number;
  nome: string;
};

type Contato = {
  id: number;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo?: boolean;
  empresaId?: number | null;
  empresa?: Empresa | null;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

type ContactForm = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  empresaId: string;
};

function getHeaders(accessToken?: string) {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function readApiError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error || data?.message || fallback;
}

function cleanDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export default function ContatoDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const contatoId = params.id;
  const [contato, setContato] = useState<Contato | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState<ContactForm>({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    empresaId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
    }

    setLoading(true);
    setError(null);

    const [contatoResponse, empresasResponse] = await Promise.all([
      fetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "GET",
        headers: getHeaders(session.accessToken),
      }),
      fetch(`${apiUrl}/empresas`, {
        method: "GET",
        headers: getHeaders(session.accessToken),
      }),
    ]);

    if (!contatoResponse.ok) {
      throw new Error(
        await readApiError(contatoResponse, "Erro ao carregar contato."),
      );
    }

    if (!empresasResponse.ok) {
      throw new Error(
        await readApiError(empresasResponse, "Erro ao carregar empresas."),
      );
    }

    const contatoData = (await contatoResponse.json()) as Contato;
    const empresasData = (await empresasResponse.json()) as Empresa[];

    setContato(contatoData);
    setEmpresas(Array.isArray(empresasData) ? empresasData : []);
    setForm({
      nome: contatoData.nome ?? "",
      cpf: contatoData.cpf ?? "",
      telefone: contatoData.telefone ?? "",
      email: contatoData.email ?? "",
      empresaId: String(contatoData.empresaId ?? contatoData.empresa?.id ?? ""),
    });
    setLoading(false);
  }, [contatoId, session?.accessToken, status]);

  useEffect(() => {
    let active = true;

    loadData().catch((error: unknown) => {
      if (!active) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Erro ao carregar contato.";
      setError(message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [loadData]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!form.nome.trim()) {
        throw new Error("Informe o nome do contato.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({
          nome: form.nome.trim(),
          cpf: form.cpf,
          telefone: form.telefone.trim(),
          email: form.email.trim(),
          empresaId: form.empresaId ? Number(form.empresaId) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Erro ao salvar contato."));
      }

      setMessage("Contato salvo com sucesso.");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar contato.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!contato) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const nextActive = !(contato.ativo ?? true);
      const response = await fetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({ ativo: nextActive }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Erro ao atualizar status."),
        );
      }

      setMessage(nextActive ? "Contato ativado." : "Contato inativado.");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar status.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function copyCurrentUrl() {
    await navigator.clipboard.writeText(window.location.href);
    setMessage("URL copiada.");
  }

  if (loading) {
    return <p style={stateTextStyle}>Carregando contato...</p>;
  }

  if (error && !contato) {
    return (
      <div style={pageStyle}>
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() => router.push("/crm/contatos")}
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Voltar para lista
        </button>
        <div style={errorBoxStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <button
            type="button"
            style={secondaryIconButtonStyle}
            onClick={() => router.push("/crm/contatos")}
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>
          <div>
            <h1 style={titleStyle}>{contato?.nome ?? `Contato ${contatoId}`}</h1>
            <span
              style={{
                ...statusBadgeStyle,
                background: contato?.ativo === false ? "#fee2e2" : "#dcfce7",
                color: contato?.ativo === false ? "#991b1b" : "#166534",
              }}
            >
              {contato?.ativo === false ? "Inativo" : "Ativo"}
            </span>
          </div>
        </div>

        <div style={headerActionsStyle}>
          <button type="button" style={secondaryButtonStyle} onClick={copyCurrentUrl}>
            <Copy size={16} strokeWidth={2.2} />
            Copiar URL
          </button>
          <button
            type="button"
            style={contato?.ativo === false ? primaryButtonStyle : dangerButtonStyle}
            onClick={handleToggleActive}
            disabled={saving}
          >
            {contato?.ativo === false ? "Ativar" : "Inativar"}
          </button>
        </div>
      </div>

      {error ? <div style={errorBoxStyle}>{error}</div> : null}
      {message ? <div style={successBoxStyle}>{message}</div> : null}

      <div style={contentGridStyle}>
        <form onSubmit={handleSave} style={panelStyle}>
          <div style={panelHeaderStyle}>
            <strong>Dados do contato</strong>
            <button type="submit" style={primaryButtonStyle} disabled={saving}>
              <Save size={16} strokeWidth={2.2} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          <div style={formGridStyle}>
            <Field label="Nome" required>
              <input
                value={form.nome}
                onChange={(event) => setForm({ ...form, nome: event.target.value })}
                style={inputStyle}
                required
              />
            </Field>
            <Field label="CPF">
              <input
                value={form.cpf}
                onChange={(event) =>
                  setForm({ ...form, cpf: cleanDigits(event.target.value, 11) })
                }
                inputMode="numeric"
                maxLength={11}
                style={inputStyle}
              />
            </Field>
            <Field label="Telefone">
              <input
                value={form.telefone}
                onChange={(event) =>
                  setForm({ ...form, telefone: event.target.value })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                style={inputStyle}
              />
            </Field>
            <Field label="Empresa">
              <select
                value={form.empresaId}
                onChange={(event) =>
                  setForm({ ...form, empresaId: event.target.value })
                }
                style={inputStyle}
              >
                <option value="">Sem empresa vinculada</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </form>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <strong>Timeline</strong>
          </div>
          <div style={timelineEmptyStyle}>
            Comentarios, acoes e historico comercial deste contato aparecerao aqui.
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
  required,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const pageStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  minWidth: 0,
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
};

const headerTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 800,
};

const contentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
  gap: "14px",
  minHeight: 0,
};

const panelStyle: CSSProperties = {
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: CSSProperties = {
  color: "#4b5563",
  fontSize: "12px",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  outline: "none",
  padding: "10px 12px",
  boxSizing: "border-box",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#fff",
  padding: "9px 12px",
  cursor: "pointer",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const secondaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
};

const secondaryIconButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const dangerButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#dc2626",
};

const statusBadgeStyle: CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  borderRadius: "999px",
  padding: "4px 9px",
  fontSize: "12px",
  fontWeight: 800,
  marginTop: "6px",
};

const errorBoxStyle: CSSProperties = {
  borderRadius: "8px",
  background: "#fee2e2",
  color: "#991b1b",
  padding: "10px 12px",
  fontSize: "13px",
  fontWeight: 700,
};

const successBoxStyle: CSSProperties = {
  ...errorBoxStyle,
  background: "#dcfce7",
  color: "#166534",
};

const stateTextStyle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: "14px",
};

const timelineEmptyStyle: CSSProperties = {
  minHeight: "180px",
  borderRadius: "8px",
  border: "1px dashed #cbd5e1",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "18px",
  lineHeight: 1.45,
};
