import Icon from './Icon';
import { mdiInstagram, mdiFacebook, mdiYoutube, mdiPill } from '@mdi/js';

export default function Footer() {
  return (
    <footer className="footer pt-80">
      <div className="footer-grid px-80">
        <div className="brand-col">
          <div className="brand-logo-footer">
            <div className="mascot-square-footer">
               <Icon path={mdiPill} size={2} color="#FFFFFF" />
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
          <a>Medicamentos</a>
          <a>Dermocosméticos</a>
          <a>Vitaminas e Suplementos</a>
          <a>Higiene Pessoal</a>
          <a>Mamãe e Bebê</a>
        </div>

        <div className="links-col">
          <h4 className="footer-title">Atendimento</h4>
          <a>Central de Ajuda</a>
          <a>Como Comprar</a>
          <a>Entregas e Prazos</a>
          <a>Trocas e Devoluções</a>
          <a>Trabalhe Conosco</a>
        </div>

        <div className="newsletter-col">
          <h4 className="footer-title">Assine nossa Newsletter</h4>
          <p className="footer-desc">Receba ofertas exclusivas, cupons de desconto e dicas de saúde direto no seu e-mail.</p>
          <div className="newsletter-group">
            <input type="email" placeholder="Seu melhor e-mail" className="newsletter-input" />
            <button className="btn-primary">Enviar</button>
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
