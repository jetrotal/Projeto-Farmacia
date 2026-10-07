import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    
    // Simulação do comportamento de Mock: Verifica match perfeito OU senha genérica 123456
    if (user && user.password === password) {
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    
    if (password === '123456') {
      const client = await this.userRepo.findOne({ where: { role: 'CUSTOMER' } });
      if (client) {
        return { id: client.id, name: client.name, email: client.email, role: client.role };
      }
    }

    throw new UnauthorizedException('E-mail ou senha incorretos');
  }
}
