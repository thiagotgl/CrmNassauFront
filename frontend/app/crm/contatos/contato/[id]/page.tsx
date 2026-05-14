"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Copy,
  Mail,
  NotebookText,
  Phone,
  Save,
  User,
  Pencil,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authFetch } from "@/components/auth-fetch";
import { useToast } from "@/components/toast-provider";

type Empresa = {
  id: number;
  nome: string;
};

type Lead = {
  id: number;
  nome: string;
  status?: string | null;
  valorEstimado?: number | null;
  criadoEm?: string;
  atualizadoEm?: string;
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
  leads?: Lead[];
};

type TipoHistorico =
  | "observacao"
  | "ligacao"
  | "whatsapp"
  | "email"
  | "alteracao_status";

type UsuarioResumo = {
  id: number;
  nome?: string | null;
  email?: string | null;
  tipo?: string | null;
};

type HistoricoContato = {
  id: number;
  titulo?: string | null;
  descricao: string;
  tipo: TipoHistorico;
  criadoEm: string;
  usuario?: UsuarioResumo | null;
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

type HistoryForm = {
  tipo: TipoHistorico;
  titulo: string;
  descricao: string;
};

type ActiveTab = "geral" | "negociacoes";

const tabOptions: { value: ActiveTab; label: string }[] = [
  { value: "geral", label: "Geral" },
  { value: "negociacoes", label: "Negociacoes" },
];

const historyTypeLabels: Record<TipoHistorico, string> = {
  observacao: "Observacao",
  ligacao: "Ligacao",
  whatsapp: "WhatsApp",
  email: "Email",
  alteracao_status: "Alteracao de status",
};

async function readApiError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error || data?.message || fallback;
}

function cleanDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function getWhatsAppLink(phone: string) {
  const digits = phone.replace(/\D/g, "");

  // Se já começar com 55 e tiver o tamanho esperado de um número BR (12 ou 13 dígitos)
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    return `https://wa.me/${digits}`;
  }

  // Se tiver 10 ou 11 dígitos (apenas DDD + número), adicionamos o 55
  if (digits.length === 10 || digits.length === 11) {
    return `https://wa.me/55${digits}`;
  }

  // Fallback: apenas limpa os dígitos
  return `https://wa.me/${digits}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatLeadStatus(status?: string | null) {
  return String(status ?? "sem_status").replace(/_/g, " ");
}

function WhatsAppIcon({
  size = 16,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.411.001 12.045c0 2.12.54 4.19 1.566 6.02L0 24l6.102-1.6a11.803 11.803 0 005.944 1.6h.005c6.637 0 12.048-5.411 12.051-12.047a11.816 11.816 0 00-3.236-8.254" />
    </svg>
  );
}

function getInitials(nome?: string | null) {
  if (!nome) return "??";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const historyTheme: Record<
  TipoHistorico,
  { bg: string; color: string; iconBg: string }
> = {
  whatsapp: { bg: "#f0fdf4", color: "#166534", iconBg: "#22c55e" }, // Verde WhatsApp vibrante
  email: { bg: "#eff6ff", color: "#1d4ed8", iconBg: "#3b82f6" }, // Azul vibrante
  ligacao: { bg: "#f5f3ff", color: "#5b21b6", iconBg: "#8b5cf6" }, // Roxo vibrante
  observacao: { bg: "#f8fafc", color: "#475569", iconBg: "#64748b" }, // Ardósia sólida
  alteracao_status: { bg: "#fff7ed", color: "#9a3412", iconBg: "#f97316" }, // Laranja vibrante
};

export default function ContatoDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const contatoId = params.id;
  const [contato, setContato] = useState<Contato | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [historicos, setHistoricos] = useState<HistoricoContato[]>([]);
  const [form, setForm] = useState<ContactForm>({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    empresaId: "",
  });
  const [historyForm, setHistoryForm] = useState<HistoryForm>({
    tipo: "observacao",
    titulo: "",
    descricao: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingHistory, setSubmittingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("geral");
  const [isEditingData, setIsEditingData] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeLabel, setCustomTypeLabel] = useState("");

  const selectedEmpresa = useMemo(
    () =>
      empresas.find((empresa) => String(empresa.id) === form.empresaId) ??
      contato?.empresa ??
      null,
    [contato?.empresa, empresas, form.empresaId],
  );

  const leads = contato?.leads ?? [];

  const loadTimeline = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated" || !session?.accessToken) {
      setLoadingTimeline(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
    }

    setLoadingTimeline(true);
    setTimelineError(null);

    const response = await authFetch(`${apiUrl}/contatos/${contatoId}/historico`, {
      method: "GET",
      accessToken: session.accessToken,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Erro ao carregar timeline."));
    }

    const data = (await response.json()) as HistoricoContato[];
    setHistoricos(Array.isArray(data) ? data : []);
    setLoadingTimeline(false);
  }, [contatoId, session?.accessToken, status]);

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
      authFetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "GET",
        accessToken: session.accessToken,
      }),
      authFetch(`${apiUrl}/empresas`, {
        method: "GET",
        accessToken: session.accessToken,
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

  useEffect(() => {
    let active = true;

    loadTimeline().catch((error: unknown) => {
      if (!active) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Erro ao carregar timeline.";
      setTimelineError(message);
      setLoadingTimeline(false);
    });

    return () => {
      active = false;
    };
  }, [loadTimeline]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.nome.trim()) {
        throw new Error("Informe o nome do contato.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await authFetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "PUT",
        accessToken: session?.accessToken,
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

      showToast({ message: "Contato salvo com sucesso.", type: "success" });
      setIsEditingData(false);
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar contato.";
      showToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (contato) {
      setForm({
        nome: contato.nome ?? "",
        cpf: contato.cpf ?? "",
        telefone: contato.telefone ?? "",
        email: contato.email ?? "",
        empresaId: String(contato.empresaId ?? contato.empresa?.id ?? ""),
      });
    }
    setIsEditingData(false);
  }

  async function handleToggleActive() {
    if (!contato) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const nextActive = !(contato.ativo ?? true);
      const response = await authFetch(`${apiUrl}/contatos/${contatoId}`, {
        method: "PUT",
        accessToken: session?.accessToken,
        body: JSON.stringify({ ativo: nextActive }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Erro ao atualizar status."),
        );
      }

      showToast({
        message: nextActive ? "Contato ativado." : "Contato inativado.",
        type: nextActive ? "success" : "warning",
      });
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar status.";
      showToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateHistory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingHistory(true);
    setTimelineError(null);

    try {
      const descricao = historyForm.descricao.trim();

      if (!descricao) {
        throw new Error("Descreva a interacao antes de salvar.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await authFetch(`${apiUrl}/contatos/${contatoId}/historico`, {
        method: "POST",
        accessToken: session?.accessToken,
        body: JSON.stringify({
          tipo: isCustomType ? "observacao" : historyForm.tipo,
          titulo: isCustomType
            ? customTypeLabel.trim()
            : historyForm.titulo.trim() || undefined,
          descricao,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Erro ao registrar interacao."),
        );
      }

      const created = (await response.json()) as HistoricoContato;
      setHistoricos((current) => [created, ...current]);
      setHistoryForm({ tipo: "observacao", titulo: "", descricao: "" });
      setCustomTypeLabel("");
      setIsCustomType(false);
      showToast({ message: "Interacao registrada.", type: "success" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao registrar interacao.";
      setTimelineError(message);
      showToast({ message, type: "error" });
    } finally {
      setSubmittingHistory(false);
    }
  }

  async function copyCurrentUrl() {
    await navigator.clipboard.writeText(window.location.href);
    showToast({ message: "URL copiada.", type: "info" });
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
    <>
      <style>{`
        .contact-page-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--crm-brand-sky) transparent;
        }

        .contact-page-scroll::-webkit-scrollbar {
          width: 0.4rem;
          height: 0.4rem;
        }

        .contact-page-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .contact-page-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .contact-page-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        .contact-panel {
          box-shadow: none;
        }

        .contact-panel:hover {
          border-color: var(--crm-brand-border);
        }

        .floating-surface {
          transition: border-color 0.18s ease;
        }

        .floating-surface:hover {
          border-color: var(--crm-brand-border);
        }

        .timeline-list {
          position: relative;
        }

        .timeline-list::before {
          content: "";
          position: absolute;
          top: var(--crm-space-2);
          bottom: var(--crm-space-2);
          left: 1.1rem;
          width: 2px;
          background: #cbd5e1;
          opacity: 1;
          border-radius: 999px;
        }

        .quick-action {
          transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
        }

        .quick-action:hover {
          background: var(--crm-brand-soft);
          border-color: var(--crm-brand-border);
          color: var(--crm-brand-primary);
        }

        @media (max-width: 980px) {
          .contact-general-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "var(--crm-radius-lg)",
                background:
                  "linear-gradient(135deg, var(--crm-brand-primary) 0%, var(--crm-brand-sky) 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
              }}
            >
              {getInitials(contato?.nome)}
            </div>
            <div>
              <h1
                style={{
                  ...titleStyle,
                  fontSize: "1.45rem",
                  color: "#fff",
                }}
              >
                {contato?.nome ?? `Contato ${contatoId}`}
              </h1>
              <div style={headerMetaStyle}>
                <StatusBadge active={contato?.ativo ?? true} />
                <span
                  style={{
                    ...headerCompanyStyle,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 600,
                  }}
                >
                  <Building2 size={14} strokeWidth={2.2} />
                  {selectedEmpresa?.nome ?? "Sem empresa vinculada"}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--crm-space-1)",
                    background: "rgba(249,115,22,0.18)",
                    color: "#fff7ed",
                    padding: "0.2rem var(--crm-space-2)",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    border: "1px solid rgba(253,186,116,0.38)",
                  }}
                >
                  <Clock3 size={13} strokeWidth={2.2} />
                  {historicos.length} interações
                </span>
              </div>
            </div>
          </div>

        <div style={headerActionsStyle}>
          <a
            href={contato?.telefone ? `tel:${contato.telefone}` : undefined}
            className="quick-action"
            style={{
              ...headerQuickActionStyle,
              opacity: contato?.telefone ? 1 : 0.5,
              pointerEvents: contato?.telefone ? "auto" : "none",
            }}
            aria-label="Ligar"
            title="Ligar"
          >
            <Phone size={16} strokeWidth={2.2} />
          </a>
          <a
            href={
              contato?.telefone ? getWhatsAppLink(contato.telefone) : undefined
            }
            target="_blank"
            rel="noreferrer"
            className="quick-action"
            style={{
              ...headerQuickActionStyle,
              opacity: contato?.telefone ? 1 : 0.5,
              pointerEvents: contato?.telefone ? "auto" : "none",
            }}
            aria-label="Abrir WhatsApp"
            title="WhatsApp"
          >
            <WhatsAppIcon size={20} />
          </a>
          <a
            href={contato?.email ? `mailto:${contato.email}` : undefined}
            className="quick-action"
            style={{
              ...headerQuickActionStyle,
              opacity: contato?.email ? 1 : 0.5,
              pointerEvents: contato?.email ? "auto" : "none",
            }}
            aria-label="Enviar email"
            title="Email"
          >
            <Mail size={16} strokeWidth={2.2} />
          </a>
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

      <div style={tabsStyle}>
        {tabOptions.map((tab) => (
          <button
            key={tab.value}
            type="button"
            style={activeTab === tab.value ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "var(--crm-brand-orange)",
                  borderRadius: "2px",
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div
        className="contact-page-scroll"
        style={{ ...contentGridStyle, marginTop: "var(--crm-space-3)" }}
      >
        {activeTab === "geral" ? (
          <div className="contact-general-grid" style={generalGridStyle}>
            <aside style={leftColumnStyle}>
              {isEditingData ? (
                <form
                  className="floating-surface"
                  onSubmit={handleSave}
                  style={editContactFormStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--crm-space-1)",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.93rem",
                        fontWeight: 700,
                        color: "#64748b",
                      }}
                    >
                      Editar Informações
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "var(--crm-space-1)",
                        display: "flex",
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="contact-page-scroll" style={editFormBodyStyle}>
                    <div style={formGridStyle}>
                    <Field label="Nome" icon={User} required>
                      <input
                        value={form.nome}
                        onChange={(event) =>
                          setForm({ ...form, nome: event.target.value })
                        }
                        style={inputStyle}
                        placeholder="Nome completo"
                        required
                      />
                    </Field>
                    <Field label="CPF" icon={NotebookText}>
                      <input
                        value={form.cpf}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            cpf: cleanDigits(event.target.value, 11),
                          })
                        }
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        maxLength={11}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="Telefone" icon={Phone}>
                      <input
                        value={form.telefone}
                        onChange={(event) =>
                          setForm({ ...form, telefone: event.target.value })
                        }
                        placeholder="(00) 00000-0000"
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="Email" icon={Mail}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm({ ...form, email: event.target.value })
                        }
                        placeholder="email@exemplo.com"
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="Empresa" icon={Building2}>
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
                  </div>
                  <div
                    style={editFormActionsStyle}
                  >
                    <button
                      type="button"
                      style={secondaryButtonStyle}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      style={primaryButtonStyle}
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="floating-surface"
                  style={{ ...floatingSurfaceStyle, height: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--crm-space-1)",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.93rem",
                        fontWeight: 700,
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--crm-space-1)",
                      }}
                    >
                      <User size={16} />
                      Informações Gerais
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingData(true)}
                      style={{
                        background: "rgba(37, 99, 235, 0.05)",
                        border: "1px solid rgba(37, 99, 235, 0.1)",
                        color: "var(--crm-brand-primary)",
                        borderRadius: "var(--crm-radius-md)",
                        padding: "var(--crm-space-1)",
                        cursor: "pointer",
                        display: "flex",
                        transition: "all 0.2s ease",
                      }}
                      title="Editar informações"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--crm-space-4)",
                      marginTop: "var(--crm-space-2)",
                      flex: 1,
                    }}
                  >
                    <ReadOnlyField
                      label="Nome completo"
                      value={contato?.nome}
                      icon={User}
                    />
                    <ReadOnlyField
                      label="CPF"
                      value={contato?.cpf}
                      icon={NotebookText}
                    />
                    <ReadOnlyField
                      label="Telefone"
                      value={contato?.telefone}
                      icon={Phone}
                      isLink
                      linkPrefix="tel:"
                    />
                    <ReadOnlyField
                      label="E-mail"
                      value={contato?.email}
                      icon={Mail}
                      isLink
                      linkPrefix="mailto:"
                    />
                    <ReadOnlyField
                      label="Empresa vinculada"
                      value={selectedEmpresa?.nome || "Nenhuma empresa"}
                      icon={Building2}
                    />
                  </div>
                </div>
              )}
            </aside>

            <main style={timelineColumnStyle}>
            <section className="floating-surface" style={timelineSurfaceStyle}>
              <form onSubmit={handleCreateHistory} style={timelineComposerStyle}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--crm-space-2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--crm-space-2)",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      { type: "observacao", label: "Observação", icon: NotebookText },
                      { type: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
                      { type: "ligacao", label: "Ligação", icon: Phone },
                      { type: "email", label: "Email", icon: Mail },
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        type="button"
                        onClick={() => {
                          setIsCustomType(false);
                          setHistoryForm({
                            ...historyForm,
                            tipo: btn.type as TipoHistorico,
                          });
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--crm-space-1)",
                          minHeight: "var(--crm-control-height-sm)",
                          padding: "0 var(--crm-space-2)",
                          borderRadius: "var(--crm-radius-md)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          border: "1px solid",
                          background:
                            !isCustomType && historyForm.tipo === btn.type
                              ? "var(--crm-brand-orange)"
                              : "#fff",
                          color:
                            !isCustomType && historyForm.tipo === btn.type
                              ? "#fff"
                              : "#64748b",
                          borderColor:
                            !isCustomType && historyForm.tipo === btn.type
                              ? "var(--crm-brand-orange)"
                              : "#e2e8f0",
                        }}
                      >
                        <btn.icon size={14} />
                        {btn.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsCustomType(!isCustomType)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--crm-space-1)",
                        minHeight: "var(--crm-control-height-sm)",
                        padding: "0 var(--crm-space-2)",
                        borderRadius: "var(--crm-radius-md)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: "1px solid",
                        background: isCustomType ? "var(--crm-brand-orange)" : "#fff",
                        color: isCustomType ? "#fff" : "#64748b",
                        borderColor: isCustomType ? "var(--crm-brand-orange)" : "#e2e8f0",
                        marginLeft: "auto",
                      }}
                    >
                      <Save size={14} />
                      Personalizado
                    </button>
                  </div>

                  {isCustomType && (
                    <input
                      value={customTypeLabel}
                      onChange={(e) => setCustomTypeLabel(e.target.value)}
                      placeholder="Qual o tipo desta ação? (ex: Visita, Reunião...)"
                      style={{
                        ...inputStyle,
                        height: "var(--crm-control-height-md)",
                        padding: "0 var(--crm-space-3)",
                      }}
                      autoFocus
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "var(--crm-space-3)",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--crm-space-2)",
                      }}
                    >
                      <textarea
                        value={historyForm.descricao}
                        onChange={(event) =>
                          setHistoryForm({
                            ...historyForm,
                            descricao: event.target.value,
                          })
                        }
                        placeholder="Descreva o que aconteceu..."
                        style={{
                          ...textareaStyle,
                          minHeight: "4rem",
                          height: "4rem",
                          padding: "var(--crm-space-2) var(--crm-space-3)",
                          background: "#fff",
                        }}
                        disabled={submittingHistory}
                        rows={2}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        ...primaryButtonStyle,
                        height: "4rem",
                        width: "3.25rem",
                        padding: 0,
                      }}
                      disabled={submittingHistory}
                    >
                      {submittingHistory ? "..." : <Save size={20} />}
                    </button>
                  </div>
                </div>
                {timelineError ? (
                  <span style={{ ...inlineErrorStyle, marginTop: "var(--crm-space-1)" }}>
                    {timelineError}
                  </span>
                ) : null}
              </form>

              {loadingTimeline ? (
                <p style={mutedTextStyle}>Carregando timeline...</p>
              ) : historicos.length > 0 ? (
                <div
                  className="contact-page-scroll"
                  style={timelineScrollAreaStyle}
                >
                  <div className="timeline-list" style={timelineListStyle}>
                    {historicos.map((item) => (
                      <TimelineItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={emptyStateStyle}>
                  Nenhuma interacao registrada. Use o formulario acima para criar o
                  primeiro registro comercial deste contato.
                </div>
              )}
            </section>
            </main>
          </div>
        ) : null}

        {activeTab === "negociacoes" ? (
          <section className="contact-panel" style={panelStyle}>
            <div style={panelHeaderStyle}>
              <strong>Negociacoes vinculadas</strong>
              <span style={countBadgeStyle}>{leads.length}</span>
            </div>

            {leads.length > 0 ? (
              <div style={leadListStyle}>
                {leads.map((lead) => (
                  <div key={lead.id} style={leadItemStyle}>
                    <div style={leadTitleStyle}>{lead.nome}</div>
                    <span style={leadStatusStyle}>
                      {formatLeadStatus(lead.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                Nenhuma negociacao vinculada a este contato.
              </div>
            )}
          </section>
        ) : null}

      </div>
    </div>
    </>
  );
}

function Field({
  children,
  label,
  required,
  icon: Icon,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>
        {Icon && <Icon size={14} style={{ marginRight: "var(--crm-space-1)" }} />}
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
  isLink,
  linkPrefix,
}: {
  label: string;
  value?: string | null;
  icon?: LucideIcon;
  isLink?: boolean;
  linkPrefix?: string;
}) {
  const content = (
    <span
      style={{
        fontSize: "0.93rem",
        fontWeight: 700,
        color: value ? "#0f172a" : "#94a3b8",
        wordBreak: "break-all",
      }}
    >
      {value || "Não informado"}
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--crm-space-1)",
        paddingBottom: "var(--crm-space-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--crm-space-2)",
          color: "#64748b",
          marginBottom: "0.15rem",
        }}
      >
        {Icon && <Icon size={14} />}
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          padding: "var(--crm-space-2) var(--crm-space-3)",
          background: "#f8fafc",
          borderRadius: "var(--crm-radius-md)",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isLink && value ? (
          <a
            href={`${linkPrefix}${value}`}
            style={{ textDecoration: "none", color: "inherit", display: "flex" }}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        ...statusBadgeStyle,
        background: active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
        color: active ? "#15803d" : "#b91c1c",
        border: `1px solid ${
          active ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"
        }`,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: active ? "#22c55e" : "#ef4444",
          marginRight: "6px",
        }}
      />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function HistoryTypeIcon({
  tipo,
  size = 17,
}: {
  tipo: TipoHistorico;
  size?: number;
}) {
  const props = { size, strokeWidth: 2.2 };
  if (tipo === "ligacao") return <Phone {...props} />;
  if (tipo === "whatsapp") return <WhatsAppIcon size={size} />;
  if (tipo === "email") return <Mail {...props} />;
  if (tipo === "alteracao_status") return <Clock3 {...props} />;
  return <NotebookText {...props} />;
}

function TimelineItem({ item }: { item: HistoricoContato }) {
  const theme = historyTheme[item.tipo] || historyTheme.observacao;

  return (
    <article style={timelineItemStyle}>
      <span
        style={{
          ...timelineIconStyle,
          background: theme.iconBg,
          color: "#ffffff", // Ícone agora branco
        }}
      >
        <HistoryTypeIcon tipo={item.tipo} />
      </span>
      <div style={timelineContentStyle}>
        <div style={timelineItemHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--crm-space-2)" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "0.15rem var(--crm-space-1)",
                borderRadius: "var(--crm-radius-sm)",
                background: theme.bg,
                color: theme.color,
              }}
            >
              {item.titulo || historyTypeLabels[item.tipo]}
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            {formatDateTime(item.criadoEm)}
          </span>
        </div>
        <p style={timelineDescriptionStyle}>{item.descricao}</p>
        <div
          style={{
            marginTop: "var(--crm-space-2)",
            paddingTop: "var(--crm-space-2)",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={timelineMetaStyle}>
            {item.usuario?.nome ? `Registrado por ${item.usuario.nome}` : ""}
          </span>
        </div>
      </div>
    </article>
  );
}

const pageStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-3)",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--crm-space-3)",
  flexWrap: "wrap",
  border: "1px solid transparent",
  borderRadius: "var(--crm-radius-lg)",
  background: "transparent",
  padding: "var(--crm-space-2) 0",
  boxShadow: "none",
};

const headerTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--crm-space-3)",
  minWidth: 0,
};

const headerMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--crm-space-2)",
  flexWrap: "wrap",
  marginTop: "var(--crm-space-1)",
};

const headerCompanyStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--crm-space-1)",
  color: "rgba(255,255,255,0.78)",
  fontSize: "0.86rem",
  fontWeight: 700,
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--crm-space-2)",
  flexWrap: "wrap",
};

const headerQuickActionStyle: CSSProperties = {
  width: "var(--crm-control-height-md)",
  height: "var(--crm-control-height-md)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "var(--crm-radius-md)",
  background: "rgba(255,255,255,0.16)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "all 0.2s ease",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.35rem",
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const contentGridStyle: CSSProperties = {
  display: "block",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  padding: "0 var(--crm-space-1) var(--crm-space-1) 0",
};

const generalGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(20rem, 28rem) minmax(0, 1fr)",
  alignItems: "stretch", // Volta para stretch para igualar alturas
  gap: "var(--crm-space-3)",
  height: "100%",
  minHeight: 0,
};

const leftColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-3)",
  minWidth: 0,
  minHeight: 0,
};

const timelineColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-3)",
  minWidth: 0,
  minHeight: 0,
  height: "100%",
};

const floatingSurfaceStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: "var(--crm-radius-lg)",
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 0.875rem 2rem rgba(15, 23, 42, 0.12)",
  color: "#1e293b",
  padding: "var(--crm-surface-padding)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-4)",
  minHeight: 0,
};

const editContactFormStyle: CSSProperties = {
  ...floatingSurfaceStyle,
  height: "100%",
  overflow: "hidden",
};

const editFormBodyStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  paddingRight: "var(--crm-space-1)",
};

const editFormActionsStyle: CSSProperties = {
  display: "flex",
  gap: "var(--crm-space-2)",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  flexShrink: 0,
  paddingTop: "var(--crm-space-2)",
  borderTop: "1px solid rgba(255,255,255,0.24)",
};

const timelineSurfaceStyle: CSSProperties = {
  ...floatingSurfaceStyle,
  background: "transparent",
  border: "none",
  boxShadow: "none",
  padding: "0",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  height: "calc(100dvh - 13.75rem)",
};

const tabsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--crm-space-5)",
  padding: "0 var(--crm-space-1)",
  borderBottom: "1px solid rgba(255,255,255,0.24)",
  width: "100%",
};

const tabStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.72)",
  padding: "var(--crm-space-2) var(--crm-space-1)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.93rem",
  position: "relative",
  transition: "all 0.2s ease",
};

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  color: "#ffffff",
};

const panelStyle: CSSProperties = {
  borderRadius: "var(--crm-radius-md)",
  background: "rgba(255,255,255,0.78)",
  color: "#111827",
  padding: "var(--crm-surface-padding)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-4)",
  border: "1px solid rgba(255,255,255,0.28)",
  backdropFilter: "blur(14px)",
  minHeight: 0,
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--crm-space-3)",
  minHeight: "var(--crm-control-height-md)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "var(--crm-space-3)",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-1)",
};

const labelStyle: CSSProperties = {
  color: "#4b5563",
  fontSize: "0.78rem",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: "1px solid rgba(226,232,240,0.78)",
  borderRadius: "var(--crm-radius-md)",
  background: "rgba(248,250,252,0.72)",
  color: "#0f172a",
  outline: "none",
  minHeight: "var(--crm-control-height-md)",
  padding: "0 var(--crm-space-3)",
  boxSizing: "border-box",
  transition: "all 0.2s ease-in-out",
  fontSize: "0.93rem",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "4.75rem",
  resize: "vertical",
  lineHeight: 1.5,
  fontSize: "0.93rem",
  background: "#fff",
  border: "1px solid #e2e8f0",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "var(--crm-radius-md)",
  background: "var(--crm-brand-orange)",
  color: "#fff",
  minHeight: "var(--crm-control-height-md)",
  padding: "0 var(--crm-space-3)",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--crm-space-2)",
  transition: "all 0.2s ease-in-out",
  fontSize: "0.93rem",
};

const secondaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "var(--crm-brand-primary)",
};

const secondaryIconButtonStyle: CSSProperties = {
  width: "var(--crm-control-height-md)",
  height: "var(--crm-control-height-md)",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const dangerButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#dc2626",
};

const statusBadgeStyle: CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  borderRadius: "999px",
  padding: "0.2rem var(--crm-space-2)",
  fontSize: "0.78rem",
  fontWeight: 800,
};

const countBadgeStyle: CSSProperties = {
  borderRadius: "999px",
  background: "var(--crm-brand-orange-soft)",
  color: "#9a3412",
  padding: "0.2rem var(--crm-space-2)",
  fontSize: "0.78rem",
  fontWeight: 800,
};

const errorBoxStyle: CSSProperties = {
  borderRadius: "var(--crm-radius-md)",
  background: "#fee2e2",
  color: "#991b1b",
  padding: "var(--crm-space-2) var(--crm-space-3)",
  fontSize: "0.86rem",
  fontWeight: 700,
};

const inlineErrorStyle: CSSProperties = {
  color: "#b91c1c",
  fontSize: "0.86rem",
  fontWeight: 700,
  marginRight: "auto",
};

const stateTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--crm-text-strong)",
  fontSize: "0.93rem",
};

const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.93rem",
};

const emptyStateStyle: CSSProperties = {
  minHeight: "5.5rem",
  borderRadius: "var(--crm-radius-md)",
  border: "1px dashed #cbd5e1",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "var(--crm-space-4)",
  lineHeight: 1.45,
};

const timelineComposerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-2)",
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: "var(--crm-radius-lg)",
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(14px)",
  padding: "var(--crm-surface-padding)",
  marginTop: "0",
  transition: "all 0.2s ease",
};

const timelineListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-3)",
  padding: "0 0 4.5rem",
};

const timelineScrollAreaStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 var(--crm-space-2) 0 0",
  scrollPaddingBottom: "4.5rem",
  marginTop: "var(--crm-space-3)",
};

const timelineItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.25rem minmax(0, 1fr)",
  gap: "var(--crm-space-3)",
};

const timelineIconStyle: CSSProperties = {
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "var(--crm-radius-md)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  zIndex: 1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const timelineContentStyle: CSSProperties = {
  minWidth: 0,
  border: "1px solid rgba(255,255,255,0.32)",
  borderRadius: "var(--crm-radius-md)",
  padding: "var(--crm-space-3) var(--crm-space-4)",
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 0.5rem 1.25rem rgba(15, 23, 42, 0.08)",
};

const timelineItemHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "var(--crm-space-2)",
  color: "#111827",
  fontSize: "0.86rem",
};

const timelineDescriptionStyle: CSSProperties = {
  margin: "var(--crm-space-2) 0",
  color: "#374151",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const timelineMetaStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "0.78rem",
  fontWeight: 700,
};

const leadListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--crm-space-2)",
};

const leadItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--crm-space-2)",
  border: "1px solid #e5e7eb",
  borderRadius: "var(--crm-radius-md)",
  padding: "var(--crm-space-2) var(--crm-space-3)",
};

const leadTitleStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 800,
};

const leadStatusStyle: CSSProperties = {
  flexShrink: 0,
  borderRadius: "999px",
  background: "#f1f5f9",
  color: "#475569",
  padding: "0.2rem var(--crm-space-2)",
  fontSize: "0.78rem",
  fontWeight: 800,
  textTransform: "capitalize",
};
