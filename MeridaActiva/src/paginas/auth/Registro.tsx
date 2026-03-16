// src/pages/Registro.tsx — Rediseño completo, estética unificada con Login
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../supabaseClient";
import Logo from "../../componentes/Logo";

interface FormData {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  aceptaTerminos?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "tempmail.com", "throwaway.email", "guerrillamail.com",
  "yopmail.com", "sharklasers.com", "10minutemail.com", "trashmail.com", "fakeinbox.com",
];

function validarNombre(n: string) {
  const l = n.trim();
  if (!l) return "El nombre es obligatorio.";
  if (l.length < 2) return "Mínimo 2 caracteres.";
  if (l.length > 50) return "Máximo 50 caracteres.";
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(l)) return "Solo letras, espacios y guiones.";
}

function validarEmail(e: string) {
  const l = e.trim().toLowerCase();
  if (!l) return "El email es obligatorio.";
  if (!EMAIL_REGEX.test(l)) return "Introduce un email válido.";
  if (DISPOSABLE_DOMAINS.includes(l.split("@")[1])) return "No se permiten emails temporales.";
}

function validarPassword(p: string) {
  if (!p) return "La contraseña es obligatoria.";
  if (p.length < 8) return "Mínimo 8 caracteres.";
  if (!/[A-Z]/.test(p)) return "Necesita al menos una mayúscula.";
  if (!/[0-9]/.test(p)) return "Necesita al menos un número.";
}

function calcularFortaleza(p: string) {
  if (!p) return { nivel: 0, label: "", color: "" };
  let pts = 0;
  if (p.length >= 8) pts++;
  if (p.length >= 12) pts++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) pts++;
  if (/\d/.test(p)) pts++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)) pts++;
  if (pts <= 1) return { nivel: 1, label: "Muy débil", color: "#D00000" };
  if (pts === 2) return { nivel: 2, label: "Débil", color: "#FF6B35" };
  if (pts === 3) return { nivel: 3, label: "Aceptable", color: "#FFBA08" };
  return { nivel: 4, label: "Fuerte", color: "#136F63" };
}

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    nombre: "", email: "", password: "", confirmPassword: "", aceptaTerminos: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const fortaleza = calcularFortaleza(form.password);
  const sanitizar = (v: string) => v.replace(/[<>]/g, "");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : sanitizar(value);
    setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validarTodo = (): boolean => {
    const errs: FormErrors = {
      nombre: validarNombre(form.nombre),
      email: validarEmail(form.email),
      password: validarPassword(form.password),
      confirmPassword: form.confirmPassword !== form.password ? "Las contraseñas no coinciden." : !form.confirmPassword ? "Confirma tu contraseña." : undefined,
      aceptaTerminos: !form.aceptaTerminos ? "Debes aceptar los términos." : undefined,
    };
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarTodo()) return;
    setEnviando(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: { data: { nombre: form.nombre.trim() } },
      });
      if (error) {
        const m: Record<string, string> = {
          "User already registered": "Este email ya está registrado. ¿Quieres iniciar sesión?",
          "Password should be at least 6 characters": "La contraseña es demasiado corta.",
          "Email rate limit exceeded": "Demasiados intentos. Inténtalo más tarde.",
        };
        throw new Error(m[error.message] ?? error.message);
      }
      toast.success("¡Cuenta creada! Revisa tu email para confirmarla.", { duration: 6000 });
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F2F5' }}>

      {/* LEFT — Visual panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-16 relative overflow-hidden"
        style={{ backgroundColor: '#032B43' }}
      >
        <div className="absolute inset-0">
          <img src="/Imagenes/Museo Romano.webp" alt="Mérida" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #032B43cc, #032B43)' }} />
        </div>

        <div className="relative z-10">
          <Logo isScrolled={true} />
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { icon: 'bi-calendar-event-fill', text: 'Accede a la agenda completa de eventos' },
            { icon: 'bi-heart-fill', text: 'Guarda tus favoritos y crea tu propia agenda' },
            { icon: 'bi-chat-left-text-fill', text: 'Valora y comenta eventos y monumentos' },
            { icon: 'bi-map-fill', text: 'Explora el mapa interactivo de la ciudad' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,186,8,0.15)' }}>
                <i className={`bi ${icon} text-sm`} style={{ color: '#FFBA08' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(250,250,250,0.7)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo className="!text-3xl" />
          </div>

          {/* Card */}
          <div className="rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/60" style={{ backgroundColor: '#FAFAFA' }}>

            <div className="mb-8">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ color: '#032B43' }}>
                Crea tu <span style={{ color: '#3F88C5' }}>cuenta</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>
                Descubre Mérida como nunca antes
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Nombre */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                  Nombre completo
                </label>
                <input
                  id="nombre" name="nombre" type="text" autoComplete="name" maxLength={50}
                  value={form.nombre} onChange={handleChange} placeholder="Ej: Ana García"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none transition-all"
                  style={{
                    backgroundColor: '#F0F2F5', color: '#032B43',
                    border: `2px solid ${errors.nombre ? '#D00000' : 'transparent'}`,
                  }}
                  onFocus={e => !errors.nombre && (e.target.style.borderColor = '#3F88C5')}
                  onBlur={e => !errors.nombre && (e.target.style.borderColor = 'transparent')}
                />
                {errors.nombre && (
                  <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#D00000' }}>
                    <i className="bi bi-exclamation-triangle-fill" /> {errors.nombre}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                  Correo electrónico
                </label>
                <input
                  id="email" name="email" type="email" autoComplete="email" maxLength={254}
                  value={form.email} onChange={handleChange} placeholder="tu@email.com"
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none transition-all"
                  style={{
                    backgroundColor: '#F0F2F5', color: '#032B43',
                    border: `2px solid ${errors.email ? '#D00000' : 'transparent'}`,
                  }}
                  onFocus={e => !errors.email && (e.target.style.borderColor = '#3F88C5')}
                  onBlur={e => !errors.email && (e.target.style.borderColor = 'transparent')}
                />
                {errors.email && (
                  <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#D00000' }}>
                    <i className="bi bi-exclamation-triangle-fill" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password" name="password" type={showPass ? "text" : "password"}
                    autoComplete="new-password" maxLength={128}
                    value={form.password} onChange={handleChange} placeholder="Mín. 8 caracteres"
                    className="w-full px-5 py-4 pr-14 rounded-2xl text-sm font-bold outline-none transition-all"
                    style={{
                      backgroundColor: '#F0F2F5', color: '#032B43',
                      border: `2px solid ${errors.password ? '#D00000' : 'transparent'}`,
                    }}
                    onFocus={e => !errors.password && (e.target.style.borderColor = '#3F88C5')}
                    onBlur={e => !errors.password && (e.target.style.borderColor = 'transparent')}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity">
                    <i className={`bi bi-eye${showPass ? '-slash' : ''} text-lg`} style={{ color: '#94a3b8' }} />
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: n <= fortaleza.nivel ? fortaleza.color : '#e2e8f0' }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: fortaleza.color }}>{fortaleza.label}</p>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#D00000' }}>
                    <i className="bi bi-exclamation-triangle-fill" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                  Repetir contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"}
                    autoComplete="new-password" maxLength={128}
                    value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña"
                    className="w-full px-5 py-4 pr-14 rounded-2xl text-sm font-bold outline-none transition-all"
                    style={{
                      backgroundColor: '#F0F2F5', color: '#032B43',
                      border: `2px solid ${errors.confirmPassword ? '#D00000' : form.confirmPassword && !errors.confirmPassword ? '#136F63' : 'transparent'}`,
                    }}
                    onFocus={e => !errors.confirmPassword && (e.target.style.borderColor = '#3F88C5')}
                    onBlur={e => !errors.confirmPassword && !form.confirmPassword && (e.target.style.borderColor = 'transparent')}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity">
                    <i className={`bi bi-eye${showConfirm ? '-slash' : ''} text-lg`} style={{ color: '#94a3b8' }} />
                  </button>
                </div>
                {form.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#136F63' }}>
                    <i className="bi bi-check-circle-fill" /> Las contraseñas coinciden
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-[10px] font-bold flex items-center gap-1" style={{ color: '#D00000' }}>
                    <i className="bi bi-exclamation-triangle-fill" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Términos */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" name="aceptaTerminos" checked={form.aceptaTerminos}
                    onChange={handleChange} className="sr-only" />
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      borderColor: errors.aceptaTerminos ? '#D00000' : form.aceptaTerminos ? '#032B43' : '#cbd5e1',
                      backgroundColor: form.aceptaTerminos ? '#032B43' : 'transparent',
                    }}
                    onClick={() => setForm(p => ({ ...p, aceptaTerminos: !p.aceptaTerminos }))}
                  >
                    {form.aceptaTerminos && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#FFBA08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>
                  Acepto los{' '}
                  <Link to="/terminos" className="font-bold underline" style={{ color: '#3F88C5' }}>términos y condiciones</Link>
                  {' '}y la{' '}
                  <Link to="/privacidad" className="font-bold underline" style={{ color: '#3F88C5' }}>política de privacidad</Link>
                </span>
              </label>
              {errors.aceptaTerminos && (
                <p className="text-[10px] font-bold flex items-center gap-1 -mt-3" style={{ color: '#D00000' }}>
                  <i className="bi bi-exclamation-triangle-fill" /> {errors.aceptaTerminos}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: '#032B43',
                  color: '#FFBA08',
                  boxShadow: '0 8px 32px rgba(3,43,67,0.2)',
                }}
              >
                {enviando ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="bi bi-arrow-repeat animate-spin" />
                    Creando cuenta...
                  </span>
                ) : 'Crear cuenta →'}
              </button>
            </form>

            <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid #e2e8f0' }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="transition-colors hover:opacity-70" style={{ color: '#3F88C5' }}>
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
