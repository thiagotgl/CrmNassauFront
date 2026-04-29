"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Pencil } from "lucide-react";

type Usuario = {
  id?: string | number;
  nome?: string;
  name?: string;
  email?: string;
  ativo?: boolean;
};

type UsuariosObjectResponse = {
  data?: Usuario[];
  usuario?: Usuario;
  usuarios?: Usuario[];
  message?: string;
};

type UsuariosResponse = Usuario[] | UsuariosObjectResponse;

type UsuarioUpdateResponse = UsuariosObjectResponse & {
  user?: Usuario;
};

type UsuarioForm = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
};

function getUsuarios(data: UsuariosResponse | null) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.usuarios ?? data?.data ?? [];
}

function getUsuarioId(usuario: Usuario) {
  return usuario.id;
}

function getUsuarioNome(usuario: Usuario) {
  return usuario.nome ?? usuario.name ?? "";
}

function getHeaders(accessToken?: string) {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export function UserList() {
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState<UsuarioForm>({
    nome: "",
    email: "",
    senha: "",
    ativo: true,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUsuarios() {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
        }

        const response = await fetch(`${apiUrl}/usuarios`, {
          method: "GET",
          headers: getHeaders(session?.accessToken),
        });

        const data = (await response.json().catch(() => null)) as
          | UsuariosResponse
          | null;

        if (!response.ok) {
          const message = !Array.isArray(data) ? data?.message : null;
          throw new Error(message || "Erro ao listar usuarios.");
        }

        if (active) {
          setUsuarios(getUsuarios(data));
        }
      } catch (error: unknown) {
        if (active) {
          const message =
            error instanceof Error ? error.message : "Erro ao listar usuarios.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsuarios();

    return () => {
      active = false;
    };
  }, [session?.accessToken]);

  function startEditing(usuario: Usuario) {
    const id = getUsuarioId(usuario);

    if (!id) {
      setError("Usuario sem identificador para edicao.");
      return;
    }

    setError(null);
    setSelectedUsuario(usuario);
    setEditForm({
      nome: getUsuarioNome(usuario),
      email: usuario.email ?? "",
      senha: "",
      ativo: usuario.ativo ?? true,
    });
  }

  function cancelEditing() {
    setSelectedUsuario(null);
    setStatusConfirmationOpen(false);
    setEditForm({
      nome: "",
      email: "",
      senha: "",
      ativo: true,
    });
  }

  async function handleSaveData() {
    const id = selectedUsuario ? getUsuarioId(selectedUsuario) : null;

    if (!id) {
      setError("Usuario sem identificador para edicao.");
      return;
    }

    const nome = editForm.nome.trim();
    const email = editForm.email.trim();

    if (!nome) {
      setError("Informe o nome do usuario.");
      return;
    }

    if (!email) {
      setError("Informe o email do usuario.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe um email valido.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/usuarios/${id}`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({
          nome,
          email,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | UsuarioUpdateResponse
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao editar usuario.");
      }

      const updatedUsuario = data?.usuario ??
        data?.user ?? { ...selectedUsuario, nome, email };

      setUsuarios((current) =>
        current.map((item) =>
          getUsuarioId(item) === id
            ? { ...item, ...updatedUsuario, nome, email }
            : item,
        ),
      );
      setSelectedUsuario((current) =>
        current ? { ...current, ...updatedUsuario, nome, email } : current,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao editar usuario.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  function requestToggleStatus() {
    setError(null);
    setStatusConfirmationOpen(true);
  }

  async function handleToggleStatus() {
    const id = selectedUsuario ? getUsuarioId(selectedUsuario) : null;

    if (!id) {
      setError("Usuario sem identificador para edicao.");
      return;
    }

    const nextAtivo = !editForm.ativo;

    setActionLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/usuarios/${id}/ativo`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({ ativo: nextAtivo }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        usuario?: Usuario;
        user?: Usuario;
      } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao atualizar status do usuario.");
      }

      const updatedUsuario =
        data?.usuario ?? data?.user ?? { ...selectedUsuario, ativo: nextAtivo };

      setUsuarios((current) =>
        current.map((item) =>
          getUsuarioId(item) === id
            ? { ...item, ...updatedUsuario, ativo: nextAtivo }
            : item,
        ),
      );
      setSelectedUsuario((current) =>
        current
          ? { ...current, ...updatedUsuario, ativo: nextAtivo }
          : current,
      );
      setEditForm((current) => ({ ...current, ativo: nextAtivo }));
      setStatusConfirmationOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do usuario.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSavePassword() {
    const id = selectedUsuario ? getUsuarioId(selectedUsuario) : null;
    const senha = editForm.senha;

    if (!id) {
      setError("Usuario sem identificador para edicao.");
      return;
    }

    if (senha.length < 6) {
      setError("Senha deve conter no minimo 6 caracteres.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
      }

      const response = await fetch(`${apiUrl}/usuarios/${id}/senha`, {
        method: "PUT",
        headers: getHeaders(session?.accessToken),
        body: JSON.stringify({ senha }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao alterar senha do usuario.");
      }

      setEditForm((current) => ({ ...current, senha: "" }));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao alterar senha do usuario.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      {loading ? <p style={stateTextStyle}>Carregando usuarios...</p> : null}
      {error ? <p style={errorStyle}>{error}</p> : null}

      {!loading && !error ? (
        selectedUsuario ? (
          <div style={editViewStyle}>
            <div style={editHeaderStyle}>
              <div style={headerActionsStyle}>
                <button
                  type="button"
                  style={backButtonStyle}
                  onClick={cancelEditing}
                  disabled={actionLoading}
                >
                  <ArrowLeft size={16} strokeWidth={2.2} />
                  Voltar
                </button>

                <button
                  type="button"
                style={
                  editForm.ativo ? dangerButtonStyle : primaryButtonStyle
                }
                onClick={requestToggleStatus}
                disabled={actionLoading}
              >
                  {editForm.ativo ? "Inativar usuario" : "Ativar usuario"}
                </button>
              </div>

              <span style={statusBadgeStyle}>
                {editForm.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>

            {statusConfirmationOpen ? (
              <div style={confirmOverlayStyle} role="dialog" aria-modal="true">
                <div style={confirmDialogStyle}>
                  <strong style={confirmTitleStyle}>
                    {editForm.ativo ? "Inativar usuario?" : "Ativar usuario?"}
                  </strong>
                  <p style={confirmTextStyle}>
                    {editForm.ativo
                      ? "Este usuario perdera o acesso ao sistema."
                      : "Este usuario voltara a ter acesso ao sistema."}
                  </p>

                  <div style={confirmActionsStyle}>
                    <button
                      type="button"
                      style={secondaryButtonStyle}
                      onClick={() => setStatusConfirmationOpen(false)}
                      disabled={actionLoading}
                    >
                      Nao
                    </button>
                    <button
                      type="button"
                      style={
                        editForm.ativo ? dangerButtonStyle : primaryButtonStyle
                      }
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                    >
                      Sim
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <strong>Dados do usuario</strong>
              </div>

              <div style={editGridStyle}>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Nome</span>
                  <input
                    value={editForm.nome}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        nome: event.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </label>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        email: event.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </label>
              </div>

              <button
                type="button"
                style={primaryButtonStyle}
                onClick={handleSaveData}
                disabled={actionLoading}
              >
                Salvar dados
              </button>
            </div>

            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <strong>Senha</strong>
              </div>

              <label style={fieldStyle}>
                <span style={labelStyle}>Nova senha</span>
                <input
                  type="password"
                  value={editForm.senha}
                  minLength={6}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      senha: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </label>

              <button
                type="button"
                style={primaryButtonStyle}
                onClick={handleSavePassword}
                disabled={actionLoading}
              >
                Alterar senha
              </button>
            </div>
          </div>
        ) : usuarios.length > 0 ? (
          <div style={tableStyle}>
            <div style={headerRowStyle}>
              <span>Nome</span>
              <span>Email</span>
              <span>Status</span>
              <span>Acoes</span>
            </div>

            {usuarios.map((usuario, index) => {
              const nome = usuario.nome ?? usuario.name ?? "Sem nome";
              const email = usuario.email ?? "Sem email";
              const ativo = usuario.ativo ?? true;

              return (
                <div key={usuario.id ?? `${email}-${index}`}>
                  <div style={rowStyle}>
                    <span style={cellTextStyle}>{nome}</span>
                    <span style={cellTextStyle}>{email}</span>
                    <span style={cellTextStyle}>
                      {ativo ? "Ativo" : "Inativo"}
                    </span>
                    <div style={actionsStyle}>
                      <button
                        type="button"
                        style={actionButtonStyle}
                        onClick={() => startEditing(usuario)}
                        aria-label="Editar usuario"
                        title="Editar"
                      >
                        <Pencil size={16} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <p style={stateTextStyle}>Nenhum usuario encontrado.</p>
        )
      ) : null}
    </div>
  );
}

const tableStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
};

const headerRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr 110px 54px",
  gap: "12px",
  padding: "12px 16px",
  background: "#f9fafb",
  color: "#374151",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr 110px 54px",
  alignItems: "center",
  gap: "12px",
  minHeight: "62px",
  padding: "10px 16px",
  borderTop: "1px solid #e5e7eb",
  color: "#111827",
};

const cellTextStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const stateTextStyle: CSSProperties = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const errorStyle: CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "13px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  color: "#111827",
  outline: "none",
};

const editViewStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const editHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  paddingBottom: "2px",
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const backButtonStyle: CSSProperties = {
  flexShrink: 0,
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  padding: "9px 12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 600,
};

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "16px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  color: "#111827",
  fontSize: "14px",
};

const editGridStyle: CSSProperties = {
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
  fontSize: "12px",
  color: "#4b5563",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};

const actionButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const primaryButtonStyle: CSSProperties = {
  alignSelf: "flex-start",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#fff",
  padding: "11px 16px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  padding: "11px 16px",
  cursor: "pointer",
  fontWeight: 700,
};

const statusBadgeStyle: CSSProperties = {
  borderRadius: "999px",
  background: "#eef2ff",
  color: "#3730a3",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: 700,
};

const dangerButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#dc2626",
};

const confirmOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "rgba(17,24,39,0.28)",
};

const confirmDialogStyle: CSSProperties = {
  width: "min(360px, 100%)",
  borderRadius: "8px",
  background: "#fff",
  boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const confirmTitleStyle: CSSProperties = {
  color: "#111827",
  fontSize: "16px",
};

const confirmTextStyle: CSSProperties = {
  margin: 0,
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: 1.45,
};

const confirmActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "6px",
};
