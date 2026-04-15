export default function LoginPage() {
  return (
    <div style={styles.container}>
      <div style={styles.overlay} />

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>GLOBAL CRM</h1>
          <p style={styles.subtitle}>Acesse sua conta</p>
        </div>

        <form style={styles.form}>
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
            Entrar
          </button>
        </form>

        <div style={styles.footer}>
          <p>Suporte: (81) 2011-6699</p>
          <span>© Nassau Tecnologia</span>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #020617, #0f172a, #1e3a8a)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top, rgba(59,130,246,0.25), transparent)',
    zIndex: 0
  },

  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    padding: '40px',
    borderRadius: '16px',
    width: '360px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff'
  },

  header: {
    marginBottom: '25px'
  },

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px',
    letterSpacing: '1px'
  },

  subtitle: {
    fontSize: '14px',
    color: '#cbd5f5'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    outline: 'none'
  },

  button: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  },

  footer: {
    marginTop: '25px',
    fontSize: '12px',
    color: '#cbd5f5',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};
