import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const Registro: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Nuevo campo para el Trigger
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Registramos en Supabase Auth y pasamos el nombre en metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre: nombre } // Esto es lo que lee tu Trigger de SQL
      }
    });

    if (error) {
      alert('Error al registrarse: ' + error.message);
    } else {
      alert('¡Registro exitoso! Revisa tu email para confirmar.');
      navigate('/login'); 
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Crear Cuenta</h2>
            <form onSubmit={handleRegistro}>
              <div className="mb-3">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Procesando...' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;