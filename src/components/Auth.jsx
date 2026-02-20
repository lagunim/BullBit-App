import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: email.split('@')[0]
            }
          }
        });
        if (error) throw error;
        alert('¡Registro exitoso! Por favor, verifica tu correo o inicia sesión si el correo no es obligatorio.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-quest-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-quest-purple rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-quest-blue rounded-full blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2a2a6e 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="w-full max-w-[400px] relative anim-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-pixel text-quest-gold drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-tighter mb-2">
            HABIT QUEST
          </h1>
          <p className="text-quest-textDim text-[10px] tracking-widest uppercase">
            {mode === 'login' ? 'Inicia tu Aventura' : 'Crea un Nuevo Héroe'}
          </p>
        </div>

        <div className="card-pixel p-6 sm:p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-quest-textDim text-[8px] uppercase mb-2 tracking-wider">Correo Electrónico</label>
              <input
                type="email"
                required
                className="input-pixel"
                placeholder="aventurero@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-quest-textDim text-[8px] uppercase mb-2 tracking-wider">Contraseña</label>
              <input
                type="password"
                required
                className="input-pixel"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-quest-red/10 border-2 border-quest-red text-quest-red text-[8px] anim-slide-in">
                Error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-[10px] ${mode === 'login' ? 'btn-pixel-green' : 'btn-pixel-gold'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'CARGANDO...' : (mode === 'login' ? 'ENTRAR AL JUEGO' : 'REGISTRAR HÉROE')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-quest-border/30 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-quest-cyan text-[8px] hover:text-white transition-colors uppercase tracking-widest cursor-pointer underline decoration-2 underline-offset-4"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-quest-textMuted text-[7px] tracking-tighter uppercase">
            v0.1.0 - BUILD 2026.02
          </p>
        </div>
      </div>

      {/* CRT Overlay */}
      <div className="crt" />
    </div>
  );
}
