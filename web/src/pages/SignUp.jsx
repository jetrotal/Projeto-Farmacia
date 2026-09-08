import { useState } from 'react';
import Icon from '../components/Icon';
import { mdiEyeOutline, mdiEyeOffOutline, mdiShieldOutline, mdiTruckOutline, mdiHeartOutline } from '@mdi/js';
import { ASSETS } from '../constants/assets';
import { useNavigation } from '../contexts/NavigationContext';

export default function SignUp() {
  const { navigate } = useNavigation();

  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '', password: '', confirm: '', terms: false });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!form.name.trim()) newErrs.name = 'Nome é obrigatório';
    if (!form.email || !emailRegex.test(form.email)) newErrs.email = 'E-mail inválido';
    if (form.cpf.replace(/\D/g, '').length !== 11) newErrs.cpf = 'CPF inválido (11 dígitos)';
    if (form.phone.replace(/\D/g, '').length < 10) newErrs.phone = 'Telefone inválido';
    if (form.password.length < 6) newErrs.password = 'A senha deve ter no mínimo 6 caracteres';
    if (form.password !== form.confirm) newErrs.confirm = 'As senhas não coincidem';
    if (!form.terms) newErrs.terms = 'Você deve aceitar os termos';

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (validate()) {
      alert('Cadastro realizado com sucesso!');
      navigate('home');
    }
  };

  return (
    <div className="page-signup">
      <div className="signup-content px-80">
        <div className="registration-card">
          
          <div className="form-panel">
            <div className="form-header">
              <h1 className="form-title">Crie sua conta</h1>
              <p className="form-subtitle">Tenha acesso a cupons exclusivos e histórico de pedidos.</p>
            </div>

            <form className="signup-form" onSubmit={handleRegister}>
              <div className="input-group">
                <label>Nome completo</label>
                <input type="text" placeholder="Ex: Dra. Márcia Souza" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={errors.name ? 'input-error' : ''}/>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input type="email" placeholder="contato@farmarcia.com.br" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={errors.email ? 'input-error' : ''}/>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" placeholder="000.000.000-00" maxLength="14" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className={errors.cpf ? 'input-error' : ''}/>
                  {errors.cpf && <span className="error-text">{errors.cpf}</span>}
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" placeholder="(11) 99999-9999" maxLength="15" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={errors.phone ? 'input-error' : ''}/>
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label>Senha</label>
                  <div className="input-with-icon">
                    <input style={{ WebkitTextSecurity: showPwd ? 'none' : 'disc' }} type="password" placeholder="••••••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={errors.password ? 'input-error' : ''}/>
                    <div className="icon-wrapper pointer" onClick={() => setShowPwd(!showPwd)}><Icon path={showPwd ? mdiEyeOffOutline : mdiEyeOutline} size={0.8} color="#6C788A"/></div>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <div className="input-group">
                  <label>Confirmar Senha</label>
                  <div className="input-with-icon">
                    <input style={{ WebkitTextSecurity: showPwd ? 'none' : 'disc' }} type="password" placeholder="••••••••••••" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} className={errors.confirm ? 'input-error' : ''}/>
                  </div>
                  {errors.confirm && <span className="error-text">{errors.confirm}</span>}
                </div>
              </div>

              <div className="input-group">
                <label className="custom-check mt-2" style={{ fontWeight: 500 }}>
                  <input type="checkbox" checked={form.terms} onChange={e => setForm({...form, terms: e.target.checked})}/> 
                  Aceito os termos de uso e políticas de privacidade da FARMARCIA.
                </label>
                {errors.terms && <span className="error-text">{errors.terms}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary w-full">Criar minha conta</button>
                <div className="login-link">
                  <span>Já tem uma conta?</span> <a className="link-cyan pointer" onClick={() => navigate('login')}>Faça login</a>
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
              <p>Cadastre-se para aproveitar descontos de até 70% em medicamentos de marca e genéricos em poucos cliques.</p>
            </div>
            <div className="welcome-benefits">
              <div className="welcome-benefit-item">
                <Icon path={mdiShieldOutline} size={1} color="#26B394" />
                <span>Seguro</span>
              </div>
              <div className="welcome-benefit-item">
                <Icon path={mdiTruckOutline} size={1} color="#26B394" />
                <span>Rápido</span>
              </div>
              <div className="welcome-benefit-item">
                <Icon path={mdiHeartOutline} size={1} color="#26B394" />
                <span>Humano</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
