import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export class HealthResponseDto {
  /** Always "ok" when the API is able to answer. */
  status!: string;

  /** Server time the probe was answered, ISO 8601. */
  timestamp!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * Liveness probe. Deliberately dependency-free so it answers even when
   * downstream infrastructure is unavailable.
   */
  @Get()
  @ApiOperation({ operationId: 'getHealth', summary: 'Liveness probe' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
