# 📋 Guía: Cómo Crear un Formulario de Contacto (React + TypeScript)

## **Objetivo**
Crear un formulario de contacto funcional y elegante con validación, estados de envío y respuesta visual al usuario.

---

## **PASO 1: Configurar Importaciones y Tipos**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeoMeta } from '../../hooks/useSeoMeta';

// Define los estados posibles
type FormState = 'idle' | 'sending' | 'success' | 'error';

// Define la estructura de datos del formulario
interface FormData {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
}
```

---

## **PASO 2: Crear Estados con useState**

```typescript
const [form, setForm] = useState<FormData>({ 
    nombre: '', 
    email: '', 
    asunto: '', 
    mensaje: '' 
});

const [estado, setEstado] = useState<FormState>('idle');
```

**¿Por qué dos estados?**
- `form`: Guarda los valores que escribe el usuario
- `estado`: Controla lo que se muestra (formulario, enviando, éxito, error)

---

## **PASO 3: Crear Manejador de Cambios**

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ 
        ...prev, 
        [e.target.name]: e.target.value 
    }));
};
```

**Cómo funciona:**
- Lee el `name` del input (nombre, email, asunto, mensaje)
- Actualiza solo ese campo sin borrar los otros
- Usa spread operator `...prev` para mantener otros valores

---

## **PASO 4: Crear Función de Envío**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene recarga de página
    
    // VALIDACIÓN: Comprueba campos obligatorios
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
        setEstado('error');
        return;
    }
    
    // ENVIANDO
    setEstado('sending');
    
    // Aquí irá: llamada a API/backend
    // await fetch('/api/contacto', { method: 'POST', body: JSON.stringify(form) })
    
    // Simular espera de 1.5 segundos
    await new Promise(r => setTimeout(r, 1500));
    
    // ÉXITO
    setEstado('success');
    setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); // Limpia
    
    // Vuelve al estado normal después de 5 segundos
    setTimeout(() => setEstado('idle'), 5000);
};
```

---

## **PASO 5: Estructura HTML con Validación**

### **Inputs de Nombre y Email**
```tsx
<input
    type="text"
    name="nombre"
    value={form.nombre}
    onChange={handleChange}
    placeholder="Tu nombre"
    required
    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-blue/20"
/>
```

### **Select de Asunto** (opcional)
```tsx
<select
    name="asunto"
    value={form.asunto}
    onChange={handleChange}
    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200"
>
    <option value="">Selecciona un asunto</option>
    <option value="Información general">Información general</option>
    <option value="Publicar evento">Publicar un evento</option>
    <option value="Sugerencia">Sugerencia de mejora</option>
    <option value="Reporte de error">Reporte de error</option>
</select>
```

### **Textarea para Mensaje**
```tsx
<textarea
    name="mensaje"
    value={form.mensaje}
    onChange={handleChange}
    placeholder="Cuéntanos en qué podemos ayudarte..."
    rows={6}
    required
    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200"
/>
```

---

## **PASO 6: Mostrar Diferentes Estados**

```tsx
{estado === 'success' ? (
    // ✅ ÉXITO: Mostrar mensaje
    <div className="text-center py-16">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-2xl font-bold">¡Mensaje enviado!</h3>
        <p className="text-slate-400">Te responderemos en 24–48 horas.</p>
    </div>
) : (
    // FORMULARIO NORMAL
    <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campos aquí */}
        
        {estado === 'error' && (
            <p className="text-red-500 font-bold">
                ⚠ Por favor, completa todos los campos obligatorios.
            </p>
        )}
        
        <button
            type="submit"
            disabled={estado === 'sending'}
            className="w-full bg-brand-dark py-5 rounded-2xl font-bold hover:bg-brand-blue disabled:opacity-60"
        >
            {estado === 'sending' ? (
                <>
                    <span className="animate-spin">⟳</span> Enviando…
                </>
            ) : (
                'Enviar Mensaje'
            )}
        </button>
    </form>
)}
```

---

## **PASO 7: Conectar a Backend (Opcional)**

Reemplaza la simulación con una llamada real:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
        setEstado('error');
        return;
    }
    
    setEstado('sending');
    
    try {
        const response = await fetch('/api/contacto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        
        if (!response.ok) throw new Error('Error al enviar');
        
        setEstado('success');
        setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
        setTimeout(() => setEstado('idle'), 5000);
    } catch (error) {
        setEstado('error');
        console.error(error);
    }
};
```

---

## **Resumen de Flujo**

```
Usuario escribe
    ↓
handleChange → actualiza estado form
    ↓
Usuario hace click en "Enviar"
    ↓
handleSubmit valida datos
    ↓
Si error → muestra ⚠ rojo
Si OK → estado = 'sending' (muestra spinner)
    ↓
Envía a API/backend
    ↓
Si éxito → estado = 'success' (muestra ✅)
Si falla → estado = 'error' (muestra ⚠)
    ↓
Auto-resetea después de 5s
```

---

## **Componente Completo**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeoMeta } from '../../hooks/useSeoMeta';

type FormState = 'idle' | 'sending' | 'success' | 'error';

interface FormData {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
}

const MiFormulario: React.FC = () => {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormData>({ 
        nombre: '', 
        email: '', 
        asunto: '', 
        mensaje: '' 
    });
    const [estado, setEstado] = useState<FormState>('idle');

    useSeoMeta({
        title: 'Contacto — Ponte en contacto',
        description: 'Envíanos un mensaje y te responderemos en 24-48 horas.',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
            setEstado('error');
            return;
        }
        
        setEstado('sending');
        
        try {
            const response = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            
            if (!response.ok) throw new Error('Error al enviar');
            
            setEstado('success');
            setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
            setTimeout(() => setEstado('idle'), 5000);
        } catch (error) {
            setEstado('error');
            console.error(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                <h2 className="text-4xl font-black uppercase mb-8">
                    Envíanos un <span className="text-brand-blue">mensaje</span>
                </h2>

                {estado === 'success' ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-black uppercase">¡Mensaje enviado!</h3>
                        <p className="text-slate-400">Te responderemos en 24–48 horas.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-blue/20"
                            />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-blue/20"
                            />
                        </div>

                        <select
                            name="asunto"
                            value={form.asunto}
                            onChange={handleChange}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                            <option value="">Selecciona un asunto</option>
                            <option value="Información general">Información general</option>
                            <option value="Publicar evento">Publicar un evento</option>
                            <option value="Sugerencia">Sugerencia de mejora</option>
                            <option value="Reporte de error">Reporte de error</option>
                        </select>

                        <textarea
                            name="mensaje"
                            value={form.mensaje}
                            onChange={handleChange}
                            placeholder="Cuéntanos en qué podemos ayudarte..."
                            rows={6}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200"
                        />

                        {estado === 'error' && (
                            <p className="text-red-500 font-bold">
                                ⚠ Por favor, completa todos los campos obligatorios.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={estado === 'sending'}
                            className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black hover:bg-brand-blue disabled:opacity-60 transition-all"
                        >
                            {estado === 'sending' ? '⟳ Enviando…' : '✉ Enviar Mensaje'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MiFormulario;
```

---

## **Conceptos Clave**

| Concepto | Explicación |
|----------|-------------|
| **useState** | Hook para guardar estado del formulario |
| **handleChange** | Función que captura cambios en inputs |
| **handleSubmit** | Función que valida y envía datos |
| **FormState** | Tipos para controlar qué mostrar |
| **e.preventDefault()** | Evita recarga de página al enviar |
| **setForm(prev => ...)** | Actualiza un campo sin borrar otros |
| **async/await** | Espera a que se complete la petición |

---

## **Próximos Pasos**

1. ✅ **Crear el componente** con esta estructura
2. ✅ **Estilizar con Tailwind** según tu diseño
3. ✅ **Conectar a tu API** (`/api/contacto`)
4. ✅ **Agregar validaciones** más robustas (email válido, etc.)
5. ✅ **Enviar emails** desde el backend
6. ✅ **Notificaciones** con toasts (react-hot-toast)

---

*Última actualización: 14 de abril de 2026*
