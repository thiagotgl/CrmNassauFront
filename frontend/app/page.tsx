"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [hoverEmail, setHoverEmail] = useState(false);
  const [hoverSenha, setHoverSenha] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  useEffect(() => {
    const move = (e: any) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      document.documentElement.style.setProperty('--x', `${x * 100}%`);
      document.documentElement.style.setProperty('--y', `${y * 100}%`);
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao logar");
      }

      console.log("Token da API:", data.token);
      window.location.href = "/home";

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* animações globais */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glowPulse {
          0% { text-shadow: 0 0 10px rgba(59,130,246,0.2); }
          50% { text-shadow: 0 0 25px rgba(59,130,246,0.6); }
          100% { text-shadow: 0 0 10px rgba(59,130,246,0.2); }
        }

        @keyframes lineGrow {
          from { width: 0; opacity: 0; }
          to { width: 120px; opacity: 1; }
        }
      `}</style>

      <div style={styles.container}>

        <div style={styles.left}>
          <div style={styles.logoWrapper}>
            <h1 style={styles.brand}>GLOBAL CRM</h1>
            <div style={styles.logoUnderline}></div>
          </div>

          <p style={styles.description}>
            Gestão inteligente de clientes e operações.
          </p>
        </div>

        <div style={styles.right}>
          <form style={styles.form} onSubmit={handleLogin}>
            <h2 style={styles.loginTitle}>Entrar</h2>

            <div style={styles.field}>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                style={{
                  ...styles.input,
                  transform: hoverEmail ? "scale(1.03)" : "scale(1)",
                  transition: "0.2s",
                  boxShadow: hoverEmail ? "0 0 10px rgba(30, 64, 175, 0.3)" : "none"
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onMouseEnter={() => setHoverEmail(true)}
                onMouseLeave={() => setHoverEmail(false)}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Senha</label>

              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  style={{
                    ...styles.input,
                    transform: hoverSenha ? "scale(1.03)" : "scale(1)",
                    transition: "0.2s",
                    boxShadow: hoverSenha ? "0 0 10px rgba(30, 64, 175, 0.3)" : "none"
                  }}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onMouseEnter={() => setHoverSenha(true)}
                  onMouseLeave={() => setHoverSenha(false)}
                  required
                />

                <span
                  style={styles.eye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button
              style={{
                ...styles.button,
                transform: hoverButton ? "scale(1.03)" : "scale(1)",
                transition: "0.2s",
                boxShadow: hoverButton ? "0 5px 15px rgba(30, 64, 175, 0.4)" : "none",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = hoverButton ? "scale(1.03)" : "scale(1)")
              }
            >
              {loading ? "Entrando..." : "Acessar sistema"}
            </button>

            <div style={styles.footer}>
              <p>Suporte: (81) 2011-6699</p>
              <span>© Nassau Tecnologia</span>
            </div>
          </form>
        </div>

      </div>
    </>
  );
}

const styles: any = {
  container: {
    height: '100vh',
    display: 'flex',
    fontFamily: 'sans-serif',
    background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), #1e3a8a, #020617)',
    transition: 'background 0.2s'
  },

  left: {
    flex: 1,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px'
  },

  logoWrapper: {
    marginBottom: '20px'
  },

  brand: {
    fontSize: '56px',
    fontWeight: '900',
    letterSpacing: '3px',
    background: 'linear-gradient(270deg, #60a5fa, #1e40af, #0ea5e9)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 6s ease infinite, glowPulse 3s ease-in-out infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },

  logoUnderline: {
    height: '4px',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #60a5fa, transparent)',
    marginTop: '8px',
    animation: 'lineGrow 1s ease forwards'
  },

  description: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '400px'
  },

  right: {
    width: '420px',
    background: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  form: {
    width: '100%',
    maxWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },

  loginTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#020617'
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a'
  },

  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #1e293b',
    outline: 'none',
    fontSize: '14px',
    color: '#020617',
    background: '#ffffff'
  },

  passwordWrapper: {
    position: 'relative',
    width: '100%'
  },

  eye: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '14px'
  },

  button: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#1e40af',
    color: '#fff',
    fontWeight: '600'
  },

  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'center'
  }
};
