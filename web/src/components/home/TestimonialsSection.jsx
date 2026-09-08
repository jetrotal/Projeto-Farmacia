import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { mdiHeartOutline } from '@mdi/js';
import { ApiService } from '../../services/api';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    ApiService.getTestimonials().then(setTestimonials);
  }, []);

  return (
    <section className="testimonials px-80">
      <div className="testimonials-header">
        <span className="badge-pink"><Icon path={mdiHeartOutline} size={0.7}/> Depoimentos</span>
        <h2 className="section-title">O carinho de quem compra na FARMARCIA</h2>
      </div>
      <div className="testimonials-grid">
        {testimonials.map(item => (
          <div key={item.id} className="testimonial-card">
            <p>“{item.text}”</p>
            <div className="user-info">
              <img src={item.avatar} alt="Avatar" className="user-avatar" />
              <div>
                <h4>{item.name}</h4>
                <span>{item.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
