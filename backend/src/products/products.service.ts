import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findFeatured() {
    return this.productRepo.find({ where: { isFeatured: true }, take: 4 });
  }

  async findCategories() {
    return ['Medicamentos', 'Dermocosméticos', 'Vitaminas', 'Higiene Pessoal', 'Bebê', 'Bem-estar'];
  }

  async findBrands() {
    return ['La Roche-Posay', 'EMS Genéricos', 'CeraVe', 'Huggies', 'Bayer', 'Neosaldina', 'Protex', 'Vichy'];
  }

  async findCatalog(query: any) {
    const qb = this.productRepo.createQueryBuilder('product');

    if (query.categories) {
      const cats = Array.isArray(query.categories) ? query.categories : [query.categories];
      qb.andWhere('product.category IN (:...cats)', { cats });
    }

    if (query.brands) {
      const brands = Array.isArray(query.brands) ? query.brands : [query.brands];
      qb.andWhere('product.brand IN (:...brands)', { brands });
    }

    if (query.search) {
      qb.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.brand) LIKE :search)', { search: `%${query.search.toLowerCase()}%` });
    }

    if (query.sortBy) {
      switch (query.sortBy) {
        case 'price-asc':
          qb.orderBy('product.priceValue', 'ASC');
          break;
        case 'price-desc':
          qb.orderBy('product.priceValue', 'DESC');
          break;
        case 'rating':
          qb.orderBy('product.rating', 'DESC');
          break;
        default:
          qb.orderBy('product.id', 'ASC'); // fallback visual (mais vendidos fake)
          break;
      }
    }

    return qb.getMany();
  }
}
