import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../auth/user.entity';
import { Testimonial } from '../testimonials/testimonial.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Testimonial) private testimonialRepo: Repository<Testimonial>,
  ) {}

  async onModuleInit() {
    const count = await this.productRepo.count();
    // Se o banco já tiver produtos, evita popular novamente
    if (count > 0) return;

    // Semeando Usuários
    await this.userRepo.save([
      { name: 'Márcia Souza', email: 'admin@farmarcia.com.br', password: 'admin', role: 'ADMIN' },
      { name: 'Cliente Farmarcia', email: 'cliente@farmarcia.com.br', password: '123456', role: 'CUSTOMER' }
    ]);

    // Função de Placeholders (simulando assets da API)
    const createPlaceholder = (width: number, height: number, bg: string, color: string, text: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" font-weight="bold" fill="#${color}">${text}</text></svg>`;
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const prodLaRoche = createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'La Roche');
    const prodRedoxon = createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Redoxon');
    const prodDipirona = createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Dipirona');
    const prodHuggies = createPlaceholder(270, 160, 'EFEFEF', '6C788A', 'Huggies');

    const MOCK_PRODUCTS = [
      { image: prodLaRoche, discount: '-20% OFF', brand: 'La Roche-Posay', name: 'Anthelios FPS 60', rating: 4, reviews: 42, oldPrice: 'R$ 89,90', price: 'R$ 71,90', priceValue: 71.90, installment: '2x de R$ 35,95', category: 'Dermocosméticos' },
      { image: prodDipirona, discount: '-65% OFF', brand: 'EMS Genéricos', name: 'Dipirona 500mg 10 comprimidos', rating: 5, reviews: 128, oldPrice: 'R$ 10,90', price: 'R$ 3,80', priceValue: 3.80, installment: '1x de R$ 3,80', category: 'Medicamentos' },
      { image: prodRedoxon, discount: '-25% OFF', brand: 'Bayer', name: 'Redoxon Vitamina C 1g Laranja', rating: 4, reviews: 15, oldPrice: 'R$ 32,90', price: 'R$ 24,60', priceValue: 24.60, installment: '1x de R$ 24,60', category: 'Vitaminas' },
      { image: prodHuggies, discount: '-18% OFF', brand: 'Huggies', name: 'Fralda Huggies Supreme Care M', rating: 5, reviews: 310, oldPrice: 'R$ 89,90', price: 'R$ 73,70', priceValue: 73.70, installment: '2x de R$ 36,85', category: 'Bebê' },
      { image: prodLaRoche, discount: '-10% OFF', brand: 'CeraVe', name: 'Loção Hidratante 200ml', rating: 5, reviews: 89, oldPrice: 'R$ 55,00', price: 'R$ 49,50', priceValue: 49.50, installment: '1x de R$ 49,50', category: 'Dermocosméticos' },
      { image: prodDipirona, discount: '-15% OFF', brand: 'Neosaldina', name: 'Neosaldina 30 drágeas', rating: 4, reviews: 210, oldPrice: 'R$ 25,00', price: 'R$ 21,25', priceValue: 21.25, installment: '1x de R$ 21,25', category: 'Medicamentos' },
      { image: prodRedoxon, discount: '-5% OFF', brand: 'Protex', name: 'Sabonete Líquido Protex 250ml', rating: 4, reviews: 45, oldPrice: 'R$ 15,00', price: 'R$ 14,25', priceValue: 14.25, installment: '1x de R$ 14,25', category: 'Higiene Pessoal' },
      { image: prodLaRoche, discount: '-30% OFF', brand: 'Vichy', name: 'Minéral 89 50ml', rating: 5, reviews: 520, oldPrice: 'R$ 199,90', price: 'R$ 139,90', priceValue: 139.90, installment: '3x de R$ 46,63', category: 'Dermocosméticos' },
    ];

    let id = 1;
    for (const p of MOCK_PRODUCTS) {
      // Deixa os 4 primeiros como em "Destaque"
      const product = this.productRepo.create({ ...p, isFeatured: id <= 4 });
      await this.productRepo.save(product);
      id++;
    }

    const avatar1 = createPlaceholder(40, 40, 'D7E4E5', '0E3D55', 'JM');
    const avatar2 = createPlaceholder(40, 40, 'D7E4E5', '0E3D55', 'CA');

    await this.testimonialRepo.save([
      { text: "A entrega da FARMARCIA foi extremamente rápida! Em menos de 2 horas eu recebi os medicamentos em casa com todo o carinho e cuidado.", name: "Juliana Mendes", subtitle: "Cliente desde 2024", avatar: avatar1 },
      { text: "Melhor preço em dermocosméticos e genéricos que eu já encontrei. O atendimento pelo WhatsApp também é impecável.", name: "Carlos Alberto", subtitle: "Cliente VIP", avatar: avatar2 }
    ]);
  }
}
