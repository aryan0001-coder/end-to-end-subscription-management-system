import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../entities/plan.entity';
import Stripe from 'stripe';

@Injectable()
export class PlansService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * On module init, sync plans from Stripe to local DB
   */
  async onModuleInit() {
    await this.syncPlansFromStripe();
  }

  /**
   * Fetch all prices from Stripe and upsert them as plans in the local DB
   */
  async syncPlansFromStripe() {
    const prices = await this.stripe.prices.list({
      expand: ['data.product'],
      limit: 100,
    });
    for (const price of prices.data) {
      let name = '';
      if (typeof price.product === 'object' && 'name' in price.product) {
        name = price.product.name;
      }
      await this.planRepository.upsert(
        {
          stripePriceId: price.id,
          name,
          amount: price.unit_amount ?? 0,
          currency: price.currency,
          interval: price.recurring?.interval ?? '',
          metadata: price.metadata ? ({ ...price.metadata } as any) : {},
        },
        ['stripePriceId'],
      );
    }
    this.logger.log('Plans synced from Stripe');
  }

  /**
   * Get all plans from the local database
   */
  async getAllPlans(): Promise<Plan[]> {
    return this.planRepository.find();
  }
}
