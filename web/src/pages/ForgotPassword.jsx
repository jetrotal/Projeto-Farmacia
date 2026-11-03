import { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { useNavigation } from '../contexts/NavigationContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';

export default function ForgotPassword() {
  const { navigate, route } = useNavigation();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiService.forgotPassword(email);
      showToast(res.message, 'success');
      setStep(2);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiService.resetPassword({ email, code, newPassword });
      showToast(res.message, 'success');
      navigate('login');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-signup">
      <div className="signup-content px-80">
        <div className="registration-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div className="form-panel">
            <div className="form-header">
              <h1 className="form-title">Recuperar Senha</h1>
              <p className="form-subtitle">
                {step === 1
                  ? 'Informe seu e-mail cadastrado para receber um código seguro de redefinição.'
                  : 'Insira o código de 6 dígitos enviado para o seu e-mail e defina sua nova senha.'}
              </p>
            </div>

            {step === 1 ? (
              <form className="signup-form" onSubmit={handleRequestToken}>
                <div className="input-group">
                  <label>E-mail cadastrado</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com.br"
                    autoComplete="email"
                  />
                </div>
                <div className="form-actions mt-2">
                  <button type="submit" className="btn-primary w-full">
                    Enviar Código de Recuperação
                  </button>
                  <a className="link-cyan pointer" onClick={() => navigate('login')}>
                    Voltar para o Login
                  </a>
                </div>
              </form>
            ) : (
              <form className="signup-form" onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label>Código de 6 dígitos</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="input-group">
                  <label>Nova Senha (mínimo 6 caracteres)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-actions mt-2">
                  <button type="submit" className="btn-primary w-full">
                    Confirmar Nova Senha
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="brand-welcome-panel">
            <div className="logo-circle">
              <img src={ASSETS.mascotWelcome} alt="Logo" />
            </div>
            <div className="welcome-text">
              <h2>Segurança em 1º lugar</h2>
              <p>
                Seus dados são protegidos com criptografia scrypt e autenticação JWT em todas as
                operações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
