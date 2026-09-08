import { useState } from 'react';
import Icon from '../components/Icon';
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js';
import { ASSETS } from '../constants/assets';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { navigate, route } = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) newErrs.email = 'E-mail é obrigatório';
    else if (!emailRegex.test(email)) newErrs.email = 'Formato de e-mail inválido';
    
    if (!password) newErrs.password = 'Senha é obrigatória';
    
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validate()) {
      const result = await login(email, password);
      if (result.success) {
        // Redireciona para a home, ou para a página que ele estava tentando acessar
        navigate(route.params?.redirectTo || 'home');
      } else {
        setApiError(result.message);
      }
    }
  };

  return (
    <div className="page-signup">
      <div className="signup-content px-80">
        <div className="registration-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="form-panel">
            <div className="form-header">
              <h1 className="form-title">Acesse sua conta</h1>
              <p className="form-subtitle">Bem-vindo de volta! Faça login para continuar de onde parou.</p>
              <p className="form-subtitle mt-2" style={{fontSize: '12px', color: 'var(--c-cyan)'}}>
                Dica de teste: Use qualquer e-mail com a senha "123456".
              </p>
            </div>

            <form className="signup-form" onSubmit={handleLogin}>
              {apiError && <div className="error-text" style={{ padding: '12px', background: '#fff1f4', border: '1px solid var(--c-pink)', borderRadius: '8px', textAlign: 'center' }}>{apiError}</div>}

              <div className="input-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  placeholder="contato@farmarcia.com.br" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div className="input-with-icon">
                  <input 
                    type="password" 
                    style={{ WebkitTextSecurity: showPwd ? 'none' : 'disc' }}
                    placeholder="••••••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'input-error' : ''}
                  />
                  <div className="icon-wrapper pointer" onClick={() => setShowPwd(!showPwd)}>
                    <Icon path={showPwd ? mdiEyeOffOutline : mdiEyeOutline} size={0.8} color="#6C788A"/>
                  </div>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <label className="custom-check">
                  <input type="checkbox" /> Lembrar-me
                </label>
                <a className="link-cyan pointer" style={{ fontSize: '14px' }} onClick={() => alert('Enviamos um link de redefinição para seu e-mail.')}>Esqueci minha senha</a>
              </div>

              <div className="form-actions mt-2">
                <button type="submit" className="btn-primary w-full">Entrar</button>
                <div className="login-link">
                  <span>Ainda não tem conta?</span> <a className="link-cyan pointer" onClick={() => navigate('signup')}>Cadastre-se</a>
                </div>
              </div>
            </form>
          </div>

          <div className="brand-welcome-panel">
            <div className="logo-circle">
              <img src={ASSETS.mascotWelcome} alt="Logo" />
            </div>
            <div className="welcome-text">
              <h2>Sua saúde bem cuidada</h2>
              <p>Ao fazer login você tem acesso a cupons de desconto, rastreio em tempo real e promoções exclusivas.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
