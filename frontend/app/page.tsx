export default function LoginPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Nassau CRM</h1>
        <p style={styles.subtitle}>Acesse sua conta</p>

        <form style={styles.form}>
          <input type="email" placeholder="E-mail" style={styles.input} />
          <input type="password" placeholder="Senha" style={styles.input} />

          <button style={styles.button}>
            Entrar
          </button>
        </form>

        <p style={styles.footer}>© Nassau Tecnologia</p>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #0f172a, #1e293b, #3b82f6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    width: '350px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  title: {
    marginBottom: '5px'
  },
  subtitle: {
    marginBottom: '20px',
    color: '#666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#999'
  }
};