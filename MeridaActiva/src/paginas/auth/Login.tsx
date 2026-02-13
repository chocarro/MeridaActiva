import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Credenciales incorrectas o usuario no confirmado.');
      setLoading(false);
    } else {
      // El estado de la sesión se actualizará automáticamente en App.tsx vía onAuthStateChange
      navigate('/');
    }
  };

  return (
    <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <h2 className="text-center fw-bold mb-4">¡Hola de nuevo!</h2>
            <p className="text-muted text-center mb-4">Accede a tu cuenta de MeridaActiva</p>

            {errorMsg && (
              <div className="alert alert-danger py-2 small" role="alert">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 shadow-sm" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : 'Entrar'}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">¿No tienes cuenta? </span>
              <Link to="/registro" className="text-primary small fw-bold text-decoration-none">Regístrate aquí</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;