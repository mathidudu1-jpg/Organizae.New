import { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import DesktopHeroPanel from '@/components/DesktopHeroPanel';

type Tab = 'login' | 'signup' | 'reset';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const inputClass =
  'h-12 bg-white border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/50 text-sm px-4 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50';

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetErrors, setResetErrors] = useState<{ email?: string }>({});

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stub handler — a lógica real (Supabase) será reconstruída depois.
  const fakeSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 800);
  };

  const handleGoogleLogin = () => fakeSubmit();

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof loginErrors = {};
    if (!isValidEmail(loginEmail)) errors.email = 'Email inválido';
    if (!loginPassword) errors.password = 'Senha é obrigatória';
    setLoginErrors(errors);
    if (Object.keys(errors).length === 0) fakeSubmit();
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof signupErrors = {};
    if (signupName.trim().length < 2) errors.name = 'Nome deve ter pelo menos 2 caracteres';
    if (!isValidEmail(signupEmail)) errors.email = 'Email inválido';
    if (signupPassword.length < 8) errors.password = 'Senha deve ter pelo menos 8 caracteres';
    if (signupPassword !== signupConfirmPassword) errors.confirmPassword = 'As senhas não coincidem';
    if (!acceptedTerms) errors.terms = 'Você deve aceitar os Termos de Uso e a Política de Privacidade';
    setSignupErrors(errors);
    if (Object.keys(errors).length === 0) fakeSubmit();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof resetErrors = {};
    if (!isValidEmail(resetEmail)) errors.email = 'Email inválido';
    setResetErrors(errors);
    if (Object.keys(errors).length === 0) {
      fakeSubmit();
      setActiveTab('login');
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left side - Desktop only */}
      <DesktopHeroPanel />

      {/* Right side - Auth forms */}
      <main className="w-full flex-1 min-h-0 flex flex-col overflow-y-auto lg:w-[40%] lg:h-full relative bg-[#f9f9fb]">
        {/* Smoke/aurora blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(160, 60%, 45%, 0.18) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute top-[40%] -right-24 w-[420px] h-[420px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(173, 58%, 39%, 0.14) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="absolute -bottom-20 -left-10 w-[450px] h-[450px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(150, 50%, 50%, 0.12) 0%, transparent 60%)',
              filter: 'blur(55px)',
            }}
          />
          <div
            className="absolute -top-16 right-0 w-[350px] h-[350px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(140, 45%, 55%, 0.10) 0%, transparent 60%)',
              filter: 'blur(45px)',
            }}
          />
        </div>

        {/* Main content */}
        <div className="w-full flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 relative z-10">
          <div className="w-full max-w-[400px] mx-auto">
            {/* Heading */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-[28px] lg:text-[32px] font-bold text-foreground leading-tight tracking-tight inline-flex items-center gap-2 flex-wrap">
                <span>
                  {activeTab === 'signup'
                    ? 'Criar conta'
                    : activeTab === 'reset'
                      ? 'Recuperar senha'
                      : 'Comece agora'}
                </span>
                {activeTab !== 'reset' && (
                  <img src="/favicon.png" alt="" className="h-[50px] w-[50px]" />
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {activeTab === 'signup'
                  ? '3 dias grátis. Sem cartão. Leva 2 minutos.'
                  : activeTab === 'reset'
                    ? 'Digite seu email para receber o link de recuperação'
                    : 'Acesse sua conta e organize suas finanças'}
              </p>
            </div>

            {/* Google button */}
            {activeTab !== 'reset' && (
              <>
                <Button
                  variant="outline"
                  className="w-full mb-5 h-11 text-sm font-medium gap-2.5 rounded-xl transition-all"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>Entrar com Google</span>
                </Button>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#f9f9fb] px-3 text-muted-foreground">ou use seu email</span>
                  </div>
                </div>
              </>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      className={`${inputClass} pr-11`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-destructive">{loginErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">Lembrar de mim</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setActiveTab('reset')}
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Entrar
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setActiveTab('signup')}
                  >
                    Criar conta
                  </button>
                </p>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    className={inputClass}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                  {signupErrors.name && <p className="text-xs text-destructive">{signupErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  {signupErrors.email && (
                    <p className="text-xs text-destructive">{signupErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Input
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      className={`${inputClass} pr-11`}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={signupPassword} />
                  {signupErrors.password && (
                    <p className="text-xs text-destructive">{signupErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      className={`${inputClass} pr-11`}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{signupErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="space-y-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (e.target.checked && signupErrors.terms) {
                          setSignupErrors((prev) => ({ ...prev, terms: undefined }));
                        }
                      }}
                      className="w-4 h-4 mt-0.5 rounded border-border cursor-pointer flex-shrink-0 accent-primary"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Li e aceito os{' '}
                      <a href="/termos-de-uso" target="_blank" className="text-primary hover:underline font-medium">
                        Termos de Uso
                      </a>{' '}
                      e a{' '}
                      <a
                        href="/politica-de-privacidade"
                        target="_blank"
                        className="text-primary hover:underline font-medium"
                      >
                        Política de Privacidade
                      </a>
                      .
                    </span>
                  </label>
                  {signupErrors.terms && (
                    <p className="text-xs text-destructive">{signupErrors.terms}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                  disabled={isSubmitting || !acceptedTerms}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Criar conta
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    className="text-primary font-semibold hover:underline"
                    onClick={() => setActiveTab('login')}
                  >
                    Entrar
                  </button>
                </p>
              </form>
            )}

            {/* Reset Form */}
            {activeTab === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  {resetErrors.email && (
                    <p className="text-xs text-destructive">{resetErrors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enviar link de recuperação
                </Button>

                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                  onClick={() => setActiveTab('login')}
                >
                  Voltar para login
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-2 mt-8 pt-6 border-t border-border/30">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <a href="/termos-de-uso" className="hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <span>·</span>
              <a href="/politica-de-privacidade" className="hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <span>·</span>
              <a href="/faq" className="hover:text-primary transition-colors">
                FAQ
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Organizae • CNPJ: 64.671.649/0001-17
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
