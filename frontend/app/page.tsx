"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLogin = (e: any) => {
    e.preventDefault();
    setLoading(true);

    // simulação (depois você conecta no backend)
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.container}>

      <div style={styles.left}>
        <h1 style={styles.brand}>GLOBAL CRM</h1>
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
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>

            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                style={styles.input}
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

          <button style={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Acessar sistema"}
          </button>

          <div style={styles.footer}>
            <p>Suporte: (81) 2011-6699</p>
            <span>© Nassau Tecnologia</span>
          </div>
        </form>
      </div>

    </div>
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

  brand: {
    fontSize: '52px',
    fontWeight: '800',
    letterSpacing: '2px',
    marginBottom: '10px'
  },

  description: {
    fontSize: '18px',
    color: '#cbd5f5',
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
    color: '#0f172a'
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155'
  },

  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '14px'
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
    background: '#2563eb',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
  },

  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'center'
  }
};
