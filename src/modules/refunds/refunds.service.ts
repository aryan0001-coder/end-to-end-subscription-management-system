import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Refund } from '../../entities/refund.entity';
import { Subscription } from '../../entities/susbscription.entity';

@Injectable()
export class RefundsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
    });

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: refund.payment_intent as string },
    });

    const localRefund = this.refundRepository.create({
      stripeRefundId: refund.id,
      amount: refund.amount,
      status: refund.status ?? '',
      createdAt: new Date(
        (refund.created ?? Math.floor(Date.now() / 1000)) * 1000,
      ),
      subscription: subscription ?? undefined,
    });
    return this.refundRepository.save(localRefund);
  }

  async getRefundById(id: number) {
    return this.refundRepository.findOne({
      where: { id },
      relations: ['subscription'],
    });
  }

  async getRefundsBySubscription(subscriptionId: string) {
    return this.refundRepository.find({
      where: { subscription: { id: subscriptionId } },
      relations: ['subscription'],
    });
  }

  async getRefundByStripeId(stripeRefundId: string) {
    return this.refundRepository.findOne({ where: { stripeRefundId } });
  }
}
