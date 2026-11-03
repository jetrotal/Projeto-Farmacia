import { Controller, Post, Get, Body } from '@nestjs/common';

@Controller()
export class AppController {
  private subscribers: { email: string; createdAt: string }[] = [];

  @Get('health')
  health() {
    return { status: 'ok', service: 'farmarcia-backend', timestamp: new Date().toISOString() };
  }

  @Post('newsletter')
  subscribe(@Body('email') email: string) {
    if (email && !this.subscribers.find((s) => s.email === email)) {
      this.subscribers.push({ email, createdAt: new Date().toISOString() });
    }
    return {
      success: true,
      message: 'Inscrição realizada com sucesso! Use o cupom BOASVINDAS10.',
    };
  }
}
