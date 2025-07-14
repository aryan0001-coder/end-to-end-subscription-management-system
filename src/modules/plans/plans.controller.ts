import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * Get all available subscription plans
   */
  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({
    status: 200,
    description: 'List of plans.',
    schema: {
      example: [
        {
          id: 1,
          stripePriceId: 'price_123',
          name: 'Pro',
          amount: 1000,
          currency: 'usd',
          interval: 'month',
          metadata: {},
        },
      ],
    },
  })
  async getAllPlans() {
    const plans = await this.plansService.getAllPlans();

    return plans.map((plan) => ({
      id: plan.id,
      stripePriceId: plan.stripePriceId,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      metadata: plan.metadata,
    }));
  }
}
