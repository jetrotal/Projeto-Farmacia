import Icon from '../components/Icon';
import { mdiEyeOutline, mdiShieldOutline, mdiTruckOutline, mdiHeartOutline } from '@mdi/js';
import { ASSETS } from '../constants/assets';

export default function SignUp() {
  return (
    <div className="page-signup">
      <div className="signup-content px-80">
        <div className="registration-card">
          
          <div className="form-panel">
            <div className="form-header">
              <h1 className="form-title">Crie sua conta</h1>
              <p className="form-subtitle">Tenha acesso a cupons exclusivos e histórico de pedidos.</p>
            </div>

            <form className="signup-form">
              <div className="input-group">
                <label>Nome completo</label>
                <input type="text" placeholder="Ex: Dra. Márcia Souza" />
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input type="email" placeholder="contato@farmarcia.com.br" />
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" placeholder="000.000.000-00" />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label>Senha</label>
                  <div className="input-with-icon">
                    <input type="password" placeholder="••••••••••••" />
                    <Icon path={mdiEyeOutline} size={0.8} color="#6C788A"/>
                  </div>
                </div>
                <div className="input-group">
                  <label>Confirmar Senha</label>
                  <div className="input-with-icon">
                    <input type="password" placeholder="••••••••••••" />
                    <Icon path={mdiEyeOutline} size={0.8} color="#6C788A"/>
                  </div>
                </div>
              </div>

              <label className="custom-check mt-2">
                <input type="checkbox" /> Aceito os termos de uso e políticas de privacidade da FARMARCIA.
              </label>

              <div className="form-actions">
                <button type="button" className="btn-primary w-full">Criar minha conta</button>
                <div className="login-link">
                  <span>Já tem uma conta?</span> <a className="link-cyan pointer">Faça login</a>
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
