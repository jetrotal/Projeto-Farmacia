import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User, Address } from './user.entity';
import { signJwt } from './jwt-auth.guard';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, 'hex');
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  }
  return storedHash === password;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpf: user.cpf || '',
      phone: user.phone || '',
      isBlocked: !!user.isBlocked,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Informe seu e-mail e sua senha.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });

    if (!user || !verifyPassword(password, user.password)) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (user.isBlocked) {
      throw new ForbiddenException(
        'Sua conta foi temporariamente suspensa pelo administrador. Entre em contato com o suporte.',
      );
    }

    // Upgrade automático para hash scrypt caso o registro antigo estivesse em texto plano
    if (!user.password.startsWith('scrypt$')) {
      user.password = hashPassword(password);
      await this.userRepo.save(user);
    }

    const sanitized = this.sanitizeUser(user);
    const token = signJwt(sanitized);
    return { ...sanitized, token, access_token: token, user: sanitized };
  }

  async register(data: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    password: string;
  }) {
    if (!data.name || !data.email || !data.password) {
      throw new BadRequestException('Nome, e-mail e senha são obrigatórios.');
    }
    if (data.password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres.');
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new BadRequestException('Este e-mail já está cadastrado na FARMARCIA.');
    }

    const newUser = this.userRepo.create({
      name: data.name.trim(),
      email: normalizedEmail,
      cpf: data.cpf || '',
      phone: data.phone || '',
      password: hashPassword(data.password),
      role: 'CUSTOMER',
      isBlocked: false,
      createdAt: new Date().toISOString(),
    });

    const saved = await this.userRepo.save(newUser);
    const sanitized = this.sanitizeUser(saved);
    const token = signJwt(sanitized);

    return {
      ...sanitized,
      token,
      access_token: token,
      user: sanitized,
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Informe um endereço de e-mail válido.');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new NotFoundException('Nenhuma conta encontrada com este endereço de e-mail.');
    }

    const token = crypto.randomInt(100000, 999999).toString();
    user.resetToken = hashPassword(token);
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await this.userRepo.save(user);

    // Log no servidor de e-mail transacional
    console.info(`[FARMARCIA Mailer] Código de recuperação para ${normalizedEmail}: ${token}`);

    return {
      success: true,
      message: `Enviamos um código de verificação de 6 dígitos para ${normalizedEmail}. Verifique sua caixa de entrada.`,
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    if (!email || !code || !newPassword) {
      throw new BadRequestException('Preencha o e-mail, o código e a nova senha.');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });

    if (
      !user ||
      !user.resetToken ||
      !user.resetTokenExpires ||
      new Date(user.resetTokenExpires).getTime() < Date.now() ||
      !verifyPassword(code.trim(), user.resetToken)
    ) {
      throw new BadRequestException('Código de recuperação inválido ou expirado.');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres.');
    }

    user.password = hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const addresses = await this.addressRepo.find({ where: { userId: user.id } });
    return {
      ...this.sanitizeUser(user),
      addresses,
    };
  }

  async updateProfile(userId: number, body: any) {
    const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (body.email && body.email.trim().toLowerCase() !== user.email) {
      const normalized = body.email.trim().toLowerCase();
      const exists = await this.userRepo.findOne({ where: { email: normalized } });
      if (exists && exists.id !== user.id) {
        throw new BadRequestException('Este e-mail já está em uso por outro usuário.');
      }
      user.email = normalized;
    }

    if (body.name) user.name = body.name.trim();
    if (body.cpf !== undefined) user.cpf = body.cpf;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.password && body.password.trim().length >= 6) {
      user.password = hashPassword(body.password.trim());
    }

    const saved = await this.userRepo.save(user);
    const sanitized = this.sanitizeUser(saved);
    const token = signJwt(sanitized);
    const addresses = await this.addressRepo.find({ where: { userId: saved.id } });

    return {
      ...sanitized,
      addresses,
      token,
      access_token: token,
    };
  }

  async getAddresses(userId: number) {
    return this.addressRepo.find({ where: { userId: Number(userId) } });
  }

  async addAddress(userId: number, data: Partial<Address>) {
    if (data.isDefault) {
      await this.addressRepo.update({ userId: Number(userId) }, { isDefault: false });
    }
    const addr = this.addressRepo.create({
      userId: Number(userId),
      label: data.label || 'Casa',
      cep: data.cep || '',
      rua: data.rua || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.cidade || 'São Paulo',
      estado: data.estado || 'SP',
      isDefault: !!data.isDefault,
    });
    await this.addressRepo.save(addr);
    return this.getAddresses(userId);
  }

  async updateAddress(userId: number, addressId: number, data: Partial<Address>) {
    const addr = await this.addressRepo.findOne({
      where: { id: Number(addressId), userId: Number(userId) },
    });
    if (!addr) throw new NotFoundException('Endereço não encontrado');

    if (data.isDefault) {
      await this.addressRepo.update({ userId: Number(userId) }, { isDefault: false });
    }

    Object.assign(addr, data);
    await this.addressRepo.save(addr);
    return this.getAddresses(userId);
  }

  async deleteAddress(userId: number, addressId: number) {
    await this.addressRepo.delete({ id: Number(addressId), userId: Number(userId) });
    return this.getAddresses(userId);
  }

  async findAllUsers() {
    const users = await this.userRepo.find({ order: { id: 'ASC' } });
    return users.map((u) => this.sanitizeUser(u));
  }

  async toggleBlockUser(userId: number, isBlocked?: boolean) {
    const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Não é permitido bloquear uma conta de Administrador.');
    }
    user.isBlocked = isBlocked !== undefined ? !!isBlocked : !user.isBlocked;
    await this.userRepo.save(user);
    return this.sanitizeUser(user);
  }
}
