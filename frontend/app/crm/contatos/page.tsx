"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Building2,
  CircleAlert,
  CircleCheck,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ActiveTab = "contatos" | "empresas";
type StatusFilter = "ativos" | "inativos" | "todos";

type Empresa = {
  id: number;
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo?: boolean;
  _count?: {
    contatos?: number;
  };
};

type Contato = {
  id: number;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo?: boolean;
  empresa?: {
    id: number;
    nome: string;
  } | null;
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

type CompanyForm = {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
};

type ToastMessage = {
  id: number;
  message: string;
  type: "success" | "error";
};

const initialContactForm: ContactForm = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  empresaId: "",
};

const initialCompanyForm: CompanyForm = {
  nome: "",
  cnpj: "",
  telefone: "",
  email: "",
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

function normalizeSearch(value?: string | number | null) {
  return String(value ?? "").toLowerCase();
}

function cleanDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export default function ContatosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>("contatos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ativos");
  const [search, setSearch] = useState("");
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedContatos, setSelectedContatos] = useState<number[]>([]);
  const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([]);
  const [loadingContatos, setLoadingContatos] = useState(true);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [contactForm, setContactForm] =
    useState<ContactForm>(initialContactForm);
  const [companyForm, setCompanyForm] =
    useState<CompanyForm>(initialCompanyForm);
  const [createCompanyWithContact, setCreateCompanyWithContact] =
    useState(false);
  const [inlineCompanyForm, setInlineCompanyForm] =
    useState<CompanyForm>(initialCompanyForm);
  const [createContactWithCompany, setCreateContactWithCompany] =
    useState(false);
  const [inlineContactForm, setInlineContactForm] =
    useState<ContactForm>(initialContactForm);
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"]) => {
      setToast({ id: Date.now(), message, type });
    },
    [],
  );

  const loadContatos = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
    }

    const response = await fetch(`${apiUrl}/contatos`, {
      method: "GET",
      headers: getHeaders(session?.accessToken),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Erro ao listar contatos."));
    }

    const data = (await response.json()) as Contato[];
    setContatos(Array.isArray(data) ? data : []);
  }, [session?.accessToken]);

  const loadEmpresas = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
    }

    const response = await fetch(`${apiUrl}/empresas`, {
      method: "GET",
      headers: getHeaders(session?.accessToken),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Erro ao listar empresas."));
    }

    const data = (await response.json()) as Empresa[];
    setEmpresas(Array.isArray(data) ? data : []);
  }, [session?.accessToken]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (status === "loading") {
        return;
      }

      if (status !== "authenticated" || !session?.accessToken) {
        setLoadingContatos(false);
        setLoadingEmpresas(false);
        return;
      }

      setLoadingContatos(true);
      setLoadingEmpresas(true);

      try {
        await Promise.all([loadContatos(), loadEmpresas()]);
      } catch (error: unknown) {
        if (active) {
          const message =
            error instanceof Error ? error.message : "Erro ao carregar dados.";
          showToast(message, "error");
        }
      } finally {
        if (active) {
          setLoadingContatos(false);
          setLoadingEmpresas(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [loadContatos, loadEmpresas, session?.accessToken, showToast, status]);

  const filteredContatos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contatos.filter((contato) => {
      const active = contato.ativo ?? true;
      const statusMatch =
        statusFilter === "todos" ||
        (statusFilter === "ativos" && active) ||
        (statusFilter === "inativos" && !active);

      if (!statusMatch) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        contato.nome,
        contato.telefone,
        contato.email,
        contato.empresa?.nome,
      ].some((value) => normalizeSearch(value).includes(term));
    });
  }, [contatos, search, statusFilter]);

  const filteredEmpresas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return empresas.filter((empresa) => {
      const active = empresa.ativo ?? true;
      const statusMatch =
        statusFilter === "todos" ||
        (statusFilter === "ativos" && active) ||
        (statusFilter === "inativos" && !active);

      if (!statusMatch) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [empresa.nome, empresa.cnpj, empresa.telefone, empresa.email].some(
        (value) => normalizeSearch(value).includes(term),
      );
    });
  }, [empresas, search, statusFilter]);

  useEffect(() => {
    setSelectedContatos([]);
    setSelectedEmpresas([]);
  }, [activeTab, statusFilter]);

  const selectedIds =
    activeTab === "contatos" ? selectedContatos : selectedEmpresas;
  const visibleIds =
    activeTab === "contatos"
      ? filteredContatos.map((contato) => contato.id)
      : filteredEmpresas.map((empresa) => empresa.id);

  function updateSelectedIds(ids: number[]) {
    if (activeTab === "contatos") {
      setSelectedContatos(ids);
      return;
    }

    setSelectedEmpresas(ids);
  }

  function toggleSelectedId(id: number) {
    updateSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  function toggleSelectAllVisible() {
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      updateSelectedIds(
        selectedIds.filter((selectedId) => !visibleIds.includes(selectedId)),
      );
      return;
    }

    updateSelectedIds(Array.from(new Set([...selectedIds, ...visibleIds])));
  }

  async function runBulkAction(action: "activate" | "inactivate") {
    if (selectedIds.length === 0) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      showToast("NEXT_PUBLIC_API_URL nao configurada.", "error");
      return;
    }

    setSubmitting(true);
    setToast(null);

    const basePath = activeTab === "contatos" ? "contatos" : "empresas";
    const failures: string[] = [];

    for (const id of selectedIds) {
      const response = await fetch(`${apiUrl}/${basePath}/${id}`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({ ativo: action === "activate" }),
      });

      if (!response.ok) {
        failures.push(
          await readApiError(response, `Erro ao processar ${basePath} ${id}.`),
        );
      }
    }

    if (activeTab === "contatos") {
      setLoadingContatos(true);
      await loadContatos().finally(() => setLoadingContatos(false));
      setSelectedContatos([]);
    } else {
      setLoadingEmpresas(true);
      await loadEmpresas().finally(() => setLoadingEmpresas(false));
      setSelectedEmpresas([]);
    }

    setSubmitting(false);

    const successCount = selectedIds.length - failures.length;

    if (failures.length > 0) {
      showToast(
        `${successCount} processados, ${failures.length} falharam. ${failures[0]}`,
        "error",
      );
      return;
    }

    showToast(
      `${successCount} atualizados com sucesso.`,
      "success",
    );
  }

  async function handleCreateContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setToast(null);

    try {
      const nome = contactForm.nome.trim();

      if (!nome) {
        throw new Error("Informe o nome do contato.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      let empresaId = contactForm.empresaId
        ? Number(contactForm.empresaId)
        : undefined;

      if (createCompanyWithContact) {
        const companyName = inlineCompanyForm.nome.trim();

        if (!companyName) {
          throw new Error("Informe o nome da nova empresa.");
        }

        const companyResponse = await fetch(`${apiUrl}/empresas`, {
          method: "POST",
          headers: getHeaders(session?.accessToken),
          body: JSON.stringify({
            nome: companyName,
            cnpj: inlineCompanyForm.cnpj,
            telefone: inlineCompanyForm.telefone.trim(),
            email: inlineCompanyForm.email.trim(),
          }),
        });

        if (!companyResponse.ok) {
          throw new Error(
            await readApiError(companyResponse, "Erro ao criar empresa."),
          );
        }

        const companyData = (await companyResponse.json()) as Empresa;
        empresaId = companyData.id;
      }

      const response = await fetch(`${apiUrl}/contatos`, {
        method: "POST",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({
          nome,
          cpf: contactForm.cpf,
          telefone: contactForm.telefone.trim(),
          email: contactForm.email.trim(),
          empresaId,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Erro ao criar contato."));
      }

      setContactForm(initialContactForm);
      setInlineCompanyForm(initialCompanyForm);
      setCreateCompanyWithContact(false);
      setContactModalOpen(false);
      showToast("Contato criado com sucesso.", "success");
      setLoadingContatos(true);
      setLoadingEmpresas(true);
      await Promise.all([loadContatos(), loadEmpresas()]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar contato.";
      showToast(message, "error");
    } finally {
      setLoadingContatos(false);
      setLoadingEmpresas(false);
      setSubmitting(false);
    }
  }

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setToast(null);

    try {
      const nome = companyForm.nome.trim();

      if (!nome) {
        throw new Error("Informe o nome da empresa.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/empresas`, {
        method: "POST",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({
          nome,
          cnpj: companyForm.cnpj,
          telefone: companyForm.telefone.trim(),
          email: companyForm.email.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Erro ao criar empresa."));
      }

      const companyData = (await response.json()) as Empresa;

      if (createContactWithCompany) {
        const contactName = inlineContactForm.nome.trim();

        if (!contactName) {
          throw new Error("Informe o nome do contato vinculado.");
        }

        const contactResponse = await fetch(`${apiUrl}/contatos`, {
          method: "POST",
          headers: getHeaders(session?.accessToken),
          body: JSON.stringify({
            nome: contactName,
            cpf: inlineContactForm.cpf,
            telefone: inlineContactForm.telefone.trim(),
            email: inlineContactForm.email.trim(),
            empresaId: companyData.id,
          }),
        });

        if (!contactResponse.ok) {
          throw new Error(
            await readApiError(contactResponse, "Erro ao criar contato."),
          );
        }
      }

      setCompanyForm(initialCompanyForm);
      setInlineContactForm(initialContactForm);
      setCreateContactWithCompany(false);
      setCompanyModalOpen(false);
      showToast(
        createContactWithCompany
          ? "Empresa e contato criados com sucesso."
          : "Empresa criada com sucesso.",
        "success",
      );
      setLoadingEmpresas(true);
      setLoadingContatos(true);
      await Promise.all([loadEmpresas(), loadContatos()]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar empresa.";
      showToast(message, "error");
    } finally {
      setLoadingEmpresas(false);
      setLoadingContatos(false);
      setSubmitting(false);
    }
  }

  const activeLoading =
    activeTab === "contatos" ? loadingContatos : loadingEmpresas;

  return (
    <div style={pageStyle}>
      <style>{`
        .crm-data-row {
          transition: background 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }

        .crm-data-row:hover {
          background: #eef2ff !important;
          box-shadow: inset 3px 0 0 #2563eb;
        }

        .crm-data-row:focus-within {
          background: #eff6ff !important;
          box-shadow: inset 3px 0 0 #1d4ed8;
        }

        .crm-data-row-inactive:hover {
          background: #f8fafc !important;
          box-shadow: inset 3px 0 0 #94a3b8;
        }
      `}</style>

      <div style={headerStyle}>
        <h1 style={titleStyle}>Contatos / Empresas</h1>

        <button
          type="button"
          style={primaryButtonStyle}
          onClick={() =>
            activeTab === "contatos"
              ? setContactModalOpen(true)
              : setCompanyModalOpen(true)
          }
        >
          <Plus size={18} strokeWidth={2.2} />
          {activeTab === "contatos" ? "Novo contato" : "Nova empresa"}
        </button>
      </div>

      <div style={toolbarStyle}>
        <div style={tabsStyle}>
          <button
            type="button"
            style={
              activeTab === "contatos" ? activeTabButtonStyle : tabButtonStyle
            }
            onClick={() => setActiveTab("contatos")}
          >
            <UserRound size={17} strokeWidth={2.2} />
            Contatos
          </button>
          <button
            type="button"
            style={
              activeTab === "empresas" ? activeTabButtonStyle : tabButtonStyle
            }
            onClick={() => setActiveTab("empresas")}
          >
            <Building2 size={17} strokeWidth={2.2} />
            Empresas
          </button>
        </div>

        <div style={statusFilterStyle}>
          {(["ativos", "inativos", "todos"] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              style={
                statusFilter === filter
                  ? activeStatusFilterButtonStyle
                  : statusFilterButtonStyle
              }
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "ativos"
                ? "Ativos"
                : filter === "inativos"
                  ? "Inativos"
                  : "Todos"}
            </button>
          ))}
        </div>

        <label style={searchWrapperStyle}>
          <Search size={17} strokeWidth={2.2} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeTab === "contatos"
                ? "Buscar por nome, telefone, email ou empresa"
                : "Buscar por nome, CNPJ, telefone ou email"
            }
            style={searchInputStyle}
          />
        </label>
      </div>

      {selectedIds.length > 0 ? (
        <div style={bulkBarStyle}>
          <strong>{selectedIds.length} selecionado(s)</strong>
          <div style={bulkActionsStyle}>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => runBulkAction("inactivate")}
              disabled={submitting}
            >
              Inativar
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => runBulkAction("activate")}
              disabled={submitting}
            >
              Ativar
            </button>
          </div>
        </div>
      ) : null}

      <div style={tableShellStyle}>
        {activeTab === "contatos" ? (
          <ContactsTable
            loading={activeLoading}
            contatos={filteredContatos}
            selectedIds={selectedContatos}
            onSelectAll={toggleSelectAllVisible}
            onToggleSelected={toggleSelectedId}
            onOpen={(id) => router.push(`/crm/contatos/contato/${id}`)}
          />
        ) : (
          <CompaniesTable
            loading={activeLoading}
            empresas={filteredEmpresas}
            selectedIds={selectedEmpresas}
            onSelectAll={toggleSelectAllVisible}
            onToggleSelected={toggleSelectedId}
            onOpen={(id) => router.push(`/crm/contatos/empresa/${id}`)}
          />
        )}
      </div>

      {contactModalOpen ? (
        <Modal title="Novo contato" onClose={() => setContactModalOpen(false)}>
          <form onSubmit={handleCreateContact} style={formStyle}>
            <div style={formGridStyle}>
              <Field label="Nome" required>
                <input
                  value={contactForm.nome}
                  onChange={(event) =>
                    setContactForm({ ...contactForm, nome: event.target.value })
                  }
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="CPF">
                <input
                  value={contactForm.cpf}
                  onChange={(event) =>
                    setContactForm({
                      ...contactForm,
                      cpf: cleanDigits(event.target.value, 11),
                    })
                  }
                  inputMode="numeric"
                  maxLength={11}
                  style={inputStyle}
                />
              </Field>

              <Field label="Telefone">
                <input
                  value={contactForm.telefone}
                  onChange={(event) =>
                    setContactForm({
                      ...contactForm,
                      telefone: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm({
                      ...contactForm,
                      email: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Empresa">
                <select
                  value={contactForm.empresaId}
                  onChange={(event) =>
                    setContactForm({
                      ...contactForm,
                      empresaId: event.target.value,
                    })
                  }
                  style={inputStyle}
                  disabled={createCompanyWithContact}
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

            <label style={inlineToggleStyle}>
              <input
                type="checkbox"
                checked={createCompanyWithContact}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setCreateCompanyWithContact(checked);

                  if (checked) {
                    setContactForm({ ...contactForm, empresaId: "" });
                  } else {
                    setInlineCompanyForm(initialCompanyForm);
                  }
                }}
              />
              Criar nova empresa e vincular a este contato
            </label>

            {createCompanyWithContact ? (
              <div style={inlineCompanyPanelStyle}>
                <strong style={inlinePanelTitleStyle}>Nova empresa</strong>

                <div style={formGridStyle}>
                  <Field label="Nome da empresa" required>
                    <input
                      value={inlineCompanyForm.nome}
                      onChange={(event) =>
                        setInlineCompanyForm({
                          ...inlineCompanyForm,
                          nome: event.target.value,
                        })
                      }
                      style={inputStyle}
                      required
                    />
                  </Field>

                  <Field label="CNPJ">
                    <input
                      value={inlineCompanyForm.cnpj}
                      onChange={(event) =>
                        setInlineCompanyForm({
                          ...inlineCompanyForm,
                          cnpj: cleanDigits(event.target.value, 14),
                        })
                      }
                      inputMode="numeric"
                      maxLength={14}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Telefone">
                    <input
                      value={inlineCompanyForm.telefone}
                      onChange={(event) =>
                        setInlineCompanyForm({
                          ...inlineCompanyForm,
                          telefone: event.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={inlineCompanyForm.email}
                      onChange={(event) =>
                        setInlineCompanyForm({
                          ...inlineCompanyForm,
                          email: event.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            <div style={modalActionsStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => setContactModalOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={primaryButtonStyle}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar contato"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {companyModalOpen ? (
        <Modal title="Nova empresa" onClose={() => setCompanyModalOpen(false)}>
          <form onSubmit={handleCreateCompany} style={formStyle}>
            <div style={formGridStyle}>
              <Field label="Nome" required>
                <input
                  value={companyForm.nome}
                  onChange={(event) =>
                    setCompanyForm({ ...companyForm, nome: event.target.value })
                  }
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="CNPJ">
                <input
                  value={companyForm.cnpj}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      cnpj: cleanDigits(event.target.value, 14),
                    })
                  }
                  inputMode="numeric"
                  maxLength={14}
                  style={inputStyle}
                />
              </Field>

              <Field label="Telefone">
                <input
                  value={companyForm.telefone}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      telefone: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      email: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </Field>
            </div>

            <label style={inlineToggleStyle}>
              <input
                type="checkbox"
                checked={createContactWithCompany}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setCreateContactWithCompany(checked);

                  if (!checked) {
                    setInlineContactForm(initialContactForm);
                  }
                }}
              />
              Criar contato vinculado a esta empresa
            </label>

            {createContactWithCompany ? (
              <div style={inlineCompanyPanelStyle}>
                <strong style={inlinePanelTitleStyle}>Contato vinculado</strong>

                <div style={formGridStyle}>
                  <Field label="Nome do contato" required>
                    <input
                      value={inlineContactForm.nome}
                      onChange={(event) =>
                        setInlineContactForm({
                          ...inlineContactForm,
                          nome: event.target.value,
                        })
                      }
                      style={inputStyle}
                      required
                    />
                  </Field>

                  <Field label="CPF">
                    <input
                      value={inlineContactForm.cpf}
                      onChange={(event) =>
                        setInlineContactForm({
                          ...inlineContactForm,
                          cpf: cleanDigits(event.target.value, 11),
                        })
                      }
                      inputMode="numeric"
                      maxLength={11}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Telefone">
                    <input
                      value={inlineContactForm.telefone}
                      onChange={(event) =>
                        setInlineContactForm({
                          ...inlineContactForm,
                          telefone: event.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={inlineContactForm.email}
                      onChange={(event) =>
                        setInlineContactForm({
                          ...inlineContactForm,
                          email: event.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            <div style={modalActionsStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => setCompanyModalOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={primaryButtonStyle}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar empresa"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {toast ? (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

function ContactsTable({
  contatos,
  loading,
  onOpen,
  onSelectAll,
  onToggleSelected,
  selectedIds,
}: {
  contatos: Contato[];
  loading: boolean;
  onOpen: (id: number) => void;
  onSelectAll: () => void;
  onToggleSelected: (id: number) => void;
  selectedIds: number[];
}) {
  if (loading) {
    return <p style={stateTextStyle}>Carregando contatos...</p>;
  }

  if (contatos.length === 0) {
    return <p style={stateTextStyle}>Nenhum contato encontrado.</p>;
  }

  return (
    <div style={tableStyle}>
      <div style={contactHeaderRowStyle}>
        <input
          type="checkbox"
          checked={
            contatos.length > 0 &&
            contatos.every((contato) => selectedIds.includes(contato.id))
          }
          onChange={onSelectAll}
          aria-label="Selecionar contatos visiveis"
        />
        <span>Nome</span>
        <span>Telefone</span>
        <span>Email</span>
        <span>Empresa</span>
        <span>Status</span>
      </div>

      {contatos.map((contato) => (
        <div
          key={contato.id}
          className={`crm-data-row ${
            contato.ativo === false ? "crm-data-row-inactive" : ""
          }`}
          style={{
            ...contactRowStyle,
            opacity: contato.ativo === false ? 0.62 : 1,
          }}
          onClick={() => onOpen(contato.id)}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(contato.id)}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleSelected(contato.id)}
            aria-label={`Selecionar contato ${contato.nome}`}
          />
          <span style={primaryCellStyle}>{contato.nome}</span>
          <span style={cellTextStyle}>{contato.telefone || "-"}</span>
          <span style={cellTextStyle}>{contato.email || "-"}</span>
          <span style={cellTextStyle}>{contato.empresa?.nome || "-"}</span>
          <StatusBadge active={contato.ativo ?? true} />
        </div>
      ))}
    </div>
  );
}

function CompaniesTable({
  empresas,
  loading,
  onOpen,
  onSelectAll,
  onToggleSelected,
  selectedIds,
}: {
  empresas: Empresa[];
  loading: boolean;
  onOpen: (id: number) => void;
  onSelectAll: () => void;
  onToggleSelected: (id: number) => void;
  selectedIds: number[];
}) {
  if (loading) {
    return <p style={stateTextStyle}>Carregando empresas...</p>;
  }

  if (empresas.length === 0) {
    return <p style={stateTextStyle}>Nenhuma empresa encontrada.</p>;
  }

  return (
    <div style={tableStyle}>
      <div style={companyHeaderRowStyle}>
        <input
          type="checkbox"
          checked={
            empresas.length > 0 &&
            empresas.every((empresa) => selectedIds.includes(empresa.id))
          }
          onChange={onSelectAll}
          aria-label="Selecionar empresas visiveis"
        />
        <span>Nome</span>
        <span>CNPJ</span>
        <span>Telefone</span>
        <span>Email</span>
        <span>Contatos</span>
        <span>Status</span>
      </div>

      {empresas.map((empresa) => (
        <div
          key={empresa.id}
          className={`crm-data-row ${
            empresa.ativo === false ? "crm-data-row-inactive" : ""
          }`}
          style={{
            ...companyRowStyle,
            opacity: empresa.ativo === false ? 0.62 : 1,
          }}
          onClick={() => onOpen(empresa.id)}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(empresa.id)}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggleSelected(empresa.id)}
            aria-label={`Selecionar empresa ${empresa.nome}`}
          />
          <span style={primaryCellStyle}>{empresa.nome}</span>
          <span style={cellTextStyle}>{empresa.cnpj || "-"}</span>
          <span style={cellTextStyle}>{empresa.telefone || "-"}</span>
          <span style={cellTextStyle}>{empresa.email || "-"}</span>
          <span style={cellTextStyle}>{empresa._count?.contatos ?? 0}</span>
          <StatusBadge active={empresa.ativo ?? true} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        ...statusBadgeStyle,
        background: active ? "#dcfce7" : "#fee2e2",
        color: active ? "#166534" : "#991b1b",
      }}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
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

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <button
        type="button"
        style={backdropStyle}
        onClick={onClose}
        aria-label="Fechar modal"
      />

      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <strong style={modalTitleStyle}>{title}</strong>
          <button
            type="button"
            style={iconButtonStyle}
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ToastNotification({
  onClose,
  toast,
}: {
  onClose: () => void;
  toast: ToastMessage;
}) {
  const duration = 4500;
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [remaining, setRemaining] = useState(duration);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimers = useCallback(
    (timeLeft: number) => {
      startedAtRef.current = Date.now();

      timeoutRef.current = setTimeout(onClose, timeLeft);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setRemaining(Math.max(remainingRef.current - elapsed, 0));
      }, 80);
    },
    [onClose],
  );

  useEffect(() => {
    clearTimers();
    remainingRef.current = duration;
    startTimers(duration);

    return clearTimers;
  }, [clearTimers, startTimers, toast.id]);

  function handleMouseEnter() {
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    setRemaining(remainingRef.current);
    clearTimers();
  }

  function handleMouseLeave() {
    if (remainingRef.current > 0) {
      startTimers(remainingRef.current);
    }
  }

  const progress = Math.max(remaining / duration, 0);
  const Icon = toast.type === "success" ? CircleCheck : CircleAlert;

  return (
    <button
      type="button"
      style={{
        ...toastStyle,
        borderColor: toast.type === "success" ? "#86efac" : "#fecaca",
      }}
      onClick={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Fechar notificacao"
      title="Clique para fechar"
    >
      <div style={toastContentStyle}>
        <span
          style={{
            ...toastIconStyle,
            color: toast.type === "success" ? "#16a34a" : "#dc2626",
          }}
        >
          <Icon size={18} strokeWidth={2.3} />
        </span>
        <span style={toastMessageStyle}>{toast.message}</span>
      </div>
      <span style={toastTimerTrackStyle}>
        <span
          style={{
            ...toastTimerBarStyle,
            transform: `scaleX(${progress})`,
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
          }}
        />
      </span>
    </button>
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
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const tabsStyle: CSSProperties = {
  display: "inline-flex",
  gap: "6px",
  padding: "4px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
};

const statusFilterStyle: CSSProperties = {
  display: "inline-flex",
  gap: "4px",
  padding: "4px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
};

const statusFilterButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "6px",
  background: "transparent",
  color: "#cbd5e1",
  padding: "7px 10px",
  cursor: "pointer",
  fontWeight: 700,
};

const activeStatusFilterButtonStyle: CSSProperties = {
  ...statusFilterButtonStyle,
  background: "#fff",
  color: "#111827",
};

const tabButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "6px",
  background: "transparent",
  color: "#cbd5e1",
  padding: "7px 10px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 700,
};

const activeTabButtonStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "#fff",
  color: "#111827",
};

const searchWrapperStyle: CSSProperties = {
  flex: "1 1 320px",
  maxWidth: "520px",
  minWidth: "240px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 10px",
  borderRadius: "8px",
  background: "#fff",
  color: "#64748b",
};

const searchInputStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  color: "#111827",
  fontSize: "14px",
};

const tableShellStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  borderRadius: "8px",
  background: "#fff",
};

const bulkBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "9px 12px",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
};

const bulkActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const tableStyle: CSSProperties = {
  minWidth: "980px",
  color: "#111827",
};

const contactHeaderRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1.2fr 150px 1.2fr 1fr 100px",
  gap: "12px",
  padding: "9px 14px",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
};

const contactRowStyle: CSSProperties = {
  ...contactHeaderRowStyle,
  minHeight: "46px",
  alignItems: "center",
  background: "#fff",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 400,
  textTransform: "none",
  borderTop: "1px solid #e5e7eb",
  cursor: "pointer",
};

const companyHeaderRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1.3fr 150px 150px 1.2fr 100px 100px",
  gap: "12px",
  padding: "9px 14px",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
};

const companyRowStyle: CSSProperties = {
  ...companyHeaderRowStyle,
  minHeight: "46px",
  alignItems: "center",
  background: "#fff",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 400,
  textTransform: "none",
  borderTop: "1px solid #e5e7eb",
  cursor: "pointer",
};

const primaryCellStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 700,
};

const cellTextStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const statusBadgeStyle: CSSProperties = {
  width: "fit-content",
  borderRadius: "999px",
  padding: "4px 9px",
  fontSize: "12px",
  fontWeight: 800,
};

const stateTextStyle: CSSProperties = {
  margin: 0,
  padding: "14px",
  color: "#64748b",
  fontSize: "14px",
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

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  border: "none",
  background: "rgba(15,23,42,0.58)",
  backdropFilter: "blur(6px)",
};

const modalStyle: CSSProperties = {
  position: "relative",
  width: "min(680px, calc(100vw - 48px))",
  maxHeight: "calc(100vh - 48px)",
  overflow: "auto",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  boxShadow: "0 24px 80px rgba(0,0,0,0.36)",
};

const modalHeaderStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "18px 20px",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
};

const modalTitleStyle: CSSProperties = {
  fontSize: "18px",
};

const iconButtonStyle: CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const formStyle: CSSProperties = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const inlineToggleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#111827",
  fontSize: "13px",
  fontWeight: 700,
};

const inlineCompanyPanelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  border: "1px solid #dbeafe",
  borderRadius: "8px",
  background: "#eff6ff",
  padding: "14px",
};

const inlinePanelTitleStyle: CSSProperties = {
  color: "#1e3a8a",
  fontSize: "14px",
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
  padding: "11px 12px",
  boxSizing: "border-box",
};

const modalActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const toastStyle: CSSProperties = {
  position: "fixed",
  right: "24px",
  bottom: "24px",
  zIndex: 90,
  width: "min(360px, calc(100vw - 48px))",
  border: "1px solid",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  boxShadow: "0 18px 48px rgba(15,23,42,0.24)",
  cursor: "pointer",
  overflow: "hidden",
  padding: 0,
  textAlign: "left",
};

const toastContentStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 14px 11px",
};

const toastIconStyle: CSSProperties = {
  width: "22px",
  height: "22px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const toastMessageStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  lineHeight: 1.35,
};

const toastTimerTrackStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "3px",
  background: "#e5e7eb",
};

const toastTimerBarStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  transformOrigin: "left center",
  transition: "transform 80ms linear",
};
