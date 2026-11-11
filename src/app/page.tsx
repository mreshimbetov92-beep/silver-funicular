"use client";

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Dashboard from './dashboard';

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'signed-out' | 'signed-in'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/demo-session', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error();
      const data = await response.json() as { authenticated?: boolean; error?: string };
      setStatus(data.authenticated ? 'signed-in' : 'signed-out');
    } catch { setStatus('signed-out'); setError('Ulanishni tekshiring va qayta urinib ko‘ring.'); }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => {
    if (status !== 'signed-in') return;
    const onFocus = () => { if (document.visibilityState === 'visible') checkSession(); };
    const timer = setInterval(checkSession, 60_000);
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [status, checkSession]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/demo-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ email, password }) });
      const data = await response.json() as { authenticated?: boolean; error?: string };
      if (!response.ok || !data.authenticated) { setError(data.error || 'Kirish amalga oshmadi. Qayta urinib ko‘ring.'); return; }
      setPassword(''); setShowPassword(false); setStatus('signed-in');
    } catch { setError('Serverga ulanish amalga oshmadi. Qayta urinib ko‘ring.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    try {
      const response = await fetch('/api/demo-session', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error();
      setStatus('signed-out'); setPassword(''); setShowPassword(false); setError(''); setMessage('Hisobdan chiqdingiz. Yana kirishingiz mumkin.');
    } catch { throw new Error('Chiqish amalga oshmadi. Internet aloqasini tekshiring.'); }
  }

  if (status === 'signed-in') return <Dashboard onLogout={logout}/>;
  return <div className="login-shell">
    <section className="login-story">
      <div className="brand login-brand"><span className="brand-mark"><BookOpen size={24}/><span/></span><span>idrok<span className="brand-dot">.</span></span></div>
      <div className="login-story-body"><span className="login-eyebrow"><Sparkles size={15}/> SIZGA MOSLASHADIGAN TA’LIM</span><h1>Bilim sari<br/>o‘z yo‘lingiz.</h1><p>Har bir javob — yangi imkoniyat.<br/>O‘z sur’atingizda o‘rganing va rivojlaning.</p>
        <div className="login-illustration" aria-hidden="true"><div className="login-orbit"/><span className="floating-math one">x²</span><span className="floating-math two">ƒ</span><div className="learning-preview"><div className="preview-icon"><GraduationCap size={25}/></div><span>Bugun yana bir qadam oldinga</span><strong>Sizga mos o‘quv yo‘li</strong><div className="preview-line"><i/><i/><i/><i/></div><div className="preview-bottom"><span><Check size={13}/> Bilimingizga mos</span><span>01 / 04</span></div></div><span className="floating-check"><Check size={17}/> Ajoyib natija!</span></div>
      </div><p className="login-story-footer">Har bir o‘quvchi uchun o‘z yo‘li.</p>
    </section>
    <section className="login-form-side"><div className="login-topline"><span className="demo-badge"><span/> Interaktiv demo</span><span>O‘zbekcha · UZ</span></div>
      <div className="login-card"><span className="login-welcome-icon"><LockKeyhole size={25}/></span><span className="eyebrow">SHAXSIY O‘QUV MAKONINGIZ</span><h2>Xush kelibsiz!</h2><p className="login-subtitle">Demo hisobingizga kiring va adaptiv ta’limni sinab ko‘ring.</p>
        {status === 'checking' ? <div className="login-loading" role="status"><LoaderCircle className="spin" size={23}/> Hisobingiz tekshirilmoqda...</div> : <form onSubmit={login}>
          <label className="login-label" htmlFor="demo-email">Login — elektron pochta</label><div className="login-input"><Mail size={18}/><input id="demo-email" type="email" name="email" autoComplete="username" placeholder="Login manzilingizni kiriting" required maxLength={320} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></div>
          <label className="login-label" htmlFor="demo-password">Parol</label><div className="login-input"><LockKeyhole size={18}/><input id="demo-password" type={showPassword?'text':'password'} name="password" autoComplete="current-password" placeholder="Parolingizni kiriting" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><button className="password-toggle" type="button" aria-label={showPassword?'Parolni yashirish':'Parolni ko‘rsatish'} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
          <p className="login-session-note"><ShieldCheck size={14}/> Ushbu qurilmada 8 soatlik kirish</p>
          {error&&<div className="login-error" role="alert">{error}</div>}{message&&<div className="login-message" role="status"><Check size={16}/>{message}</div>}
          <button className="primary-button login-submit" disabled={busy} type="submit">{busy?<><LoaderCircle size={17} className="spin"/> Tekshirilmoqda...</>:<>Hisobga kirish <ArrowRight size={17}/></>}</button>
        </form>}
        <div className="login-info"><Sparkles size={18}/><p><strong>O‘rganish sizdan boshlanadi.</strong><br/>4 ta mavzu, 72 ta savol va sizga mos tavsiyalar.</p></div>
        <p className="login-demo-note">Bu demo hisob. Mashg‘ulot natijalari shu brauzerda saqlanadi.</p>
      </div><p className="login-bottom">idrok. <span>O‘z sur’atingizda. O‘z yo‘lingizda.</span></p>
    </section>
  </div>;
}
