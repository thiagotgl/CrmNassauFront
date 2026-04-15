"use client";

import { useEffect } from "react";

export default function LoginPage() {

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

  return (
    <div style={styles.container}>

      <div style={styles.left}>
        <h1 style={styles.brand}>GLOBAL CRM</h1>
        <p style={styles.description}>
          Gestão inteligente de clientes, vendas e operações.
        </p>

        <div style={styles.glow} />
      </div>

      <div style={styles.right}>
        <form style={styles.form}>
          <h2 style={styles.loginTitle}>Entrar</h2>

          <input
            type="email"
            placeholder="E-mail"
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Senha"
            style={styles.input}
          />

          <button style={styles.button}>
            Acessar sistema
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

  // LADO ESQUERDO (BRANDING)
  left: {
    flex: 1,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px',
    position: 'relative'
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

  glow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent)',
    filter: 'blur(100px)',
    top: '20%',
    left: '10%',
    zIndex: 0
  },

  // LADO DIREITO (LOGIN)
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

  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px'
  },

  button: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg, #2563eb, #1e40af)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
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
