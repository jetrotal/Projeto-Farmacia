import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, AdminGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('auth/register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('auth/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('auth/reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getMe(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserProfile(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && Number(req.user.id) !== Number(id)) {
      throw new ForbiddenException('Sem permissão para visualizar este perfil.');
    }
    return this.authService.getProfile(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  async updateProfile(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && Number(req.user.id) !== Number(id)) {
      throw new ForbiddenException('Você só pode editar seu próprio perfil.');
    }
    return this.authService.updateProfile(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/addresses')
  async getAddresses(@Param('id') id: string, @Req() req: any) {
    const targetId = id === 'me' ? req.user.id : Number(id);
    return this.authService.getAddresses(targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/addresses')
  async addAddress(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const targetId = id === 'me' ? req.user.id : Number(id);
    return this.authService.addAddress(targetId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/addresses/:addressId')
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const targetId = id === 'me' ? req.user.id : Number(id);
    return this.authService.updateAddress(targetId, Number(addressId), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id/addresses/:addressId')
  async deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Req() req: any,
  ) {
    const targetId = id === 'me' ? req.user.id : Number(id);
    return this.authService.deleteAddress(targetId, Number(addressId));
  }

  @UseGuards(AdminGuard)
  @Get('users')
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  @UseGuards(AdminGuard)
  @Patch('users/:id/block')
  async toggleBlock(@Param('id') id: string, @Body('isBlocked') isBlocked: boolean) {
    return this.authService.toggleBlockUser(Number(id), isBlocked);
  }
}
