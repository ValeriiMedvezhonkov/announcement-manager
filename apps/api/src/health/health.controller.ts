import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  /**
   * Liveness probe. Deliberately dependency-free so it answers even when
   * downstream infrastructure is unavailable.
   */
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
