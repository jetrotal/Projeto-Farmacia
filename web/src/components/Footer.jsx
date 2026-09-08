import { useState } from 'react';
import Icon from './Icon';
import { mdiInstagram, mdiFacebook, mdiYoutube } from '@mdi/js';
import { ASSETS } from '../constants/assets';
import { ApiService } from '../services/api';
import { useNavigation } from '../contexts/NavigationContext';

export default function Footer() {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');

  const handleNewsletter = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
      alert('Por favor, informe um e-mail válido.');
      return;
    }
    await ApiService.subscribeNewsletter(email);
    alert('Obrigado! Você se inscreveu com sucesso.');
    setEmail('');
  };

  return (
    <footer className="footer pt-80">
      <div className="footer-grid px-80">
        <div className="brand-col">
          <div className="brand-logo-footer">
            <div className="mascot-square-footer">
               <img src={ASSETS.mascotHero} style={{ width: '60px', translate: '5px -4px'  }}></img>
            </div>
            <span className="brand-text-footer">FARMARCIA</span>
          </div>
          <p className="footer-desc">
            Sua saúde em boas mãos. A FARMARCIA oferece as melhores marcas de medicamentos, dermocosméticos, higiene e bem-estar com entrega expressa e carinho de verdade.
          </p>
          <div className="social-row">
            <div className="social-icon"><Icon path={mdiInstagram} size={1} /></div>
            <div className="social-icon"><Icon path={mdiFacebook} size={1} /></div>
            <div className="social-icon"><Icon path={mdiYoutube} size={1} /></div>
          </div>
        </div>

        <div className="links-col">
          <h4 className="footer-title">Departamentos</h4>
          <a onClick={() => navigate('catalog', { category: 'Medicamentos' })}>Medicamentos</a>
          <a onClick={() => navigate('catalog', { category: 'Dermocosméticos' })}>Dermocosméticos</a>
          <a onClick={() => navigate('catalog', { category: 'Vitaminas' })}>Vitaminas e Suplementos</a>
          <a onClick={() => navigate('catalog', { category: 'Higiene Pessoal' })}>Higiene Pessoal</a>
          <a onClick={() => navigate('departments')}>Todos os Departamentos</a>
        </div>

        <div className="links-col">
          <h4 className="footer-title">Atendimento</h4>
          <a onClick={() => navigate('info', { title: 'Central de Ajuda' })}>Central de Ajuda</a>
          <a onClick={() => navigate('info', { title: 'Como Comprar' })}>Como Comprar</a>
          <a onClick={() => navigate('info', { title: 'Entregas e Prazos' })}>Entregas e Prazos</a>
          <a onClick={() => navigate('info', { title: 'Trocas e Devoluções' })}>Trocas e Devoluções</a>
          <a onClick={() => navigate('info', { title: 'Trabalhe Conosco' })}>Trabalhe Conosco</a>
        </div>

        <div className="newsletter-col">
          <h4 className="footer-title">Assine nossa Newsletter</h4>
          <p className="footer-desc">Receba ofertas exclusivas, cupons de desconto e dicas de saúde direto no seu e-mail.</p>
          <div className="newsletter-group">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="newsletter-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-primary" onClick={handleNewsletter}>Enviar</button>
          </div>
        </div>
      </div>

      <div className="footer-divider px-80"><div className="line"></div></div>

      <div className="footer-lower px-80">
        <span>© 2026 FARMARCIA LTDA. CNPJ: 12.345.678/0001-90. Todos os direitos reservados.</span>
        <span>Farmacêutica Responsável: Dra. Márcia Souza CRF-SP: 98765</span>
      </div>
    </footer>
  );
}
