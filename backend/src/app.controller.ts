import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  @Post('newsletter')
  subscribe(@Body('email') email: string) {
    // Apenas simula o sucesso da inscrição como no mock original
    return { success: true };
  }
}
