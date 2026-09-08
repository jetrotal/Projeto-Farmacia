import Icon from '../Icon';
import { mdiTruckOutline, mdiTagOutline, mdiClockOutline, mdiLockOutline } from '@mdi/js';

const BENEFITS = [
  { icon: mdiTruckOutline, title: 'Frete grátis acima de R$150', subtitle: 'Para todo o Brasil express' },
  { icon: mdiTagOutline, title: 'Até 70% de desconto', subtitle: 'Em genéricos e selecionados' },
  { icon: mdiClockOutline, title: 'Entrega expressa rápida', subtitle: 'Em até 4 horas na sua casa' },
  { icon: mdiLockOutline, title: 'Pagamento 100% seguro', subtitle: 'Cartão, Pix ou Boleto' },
];

export default function BenefitsSection() {
  return (
    <section className="benefits px-80">
      {BENEFITS.map((benefit, idx) => (
        <div key={idx} className="benefit-item">
          <div className="benefit-icon"><Icon path={benefit.icon} size={1} color="#26B394" /></div>
          <div>
            <h4 className="benefit-title">{benefit.title}</h4>
            <p className="benefit-subtitle">{benefit.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
