import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../entities/susbscription.entity';
import { User } from '../../entities/user.entity';
import { Plan } from '../../entities/plan.entity';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createSubscription(userId: string, priceId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.stripeCustomerId)
      throw new NotFoundException('User has no Stripe customer');

    // Create Stripe subscription
    const stripeSub: Stripe.Subscription =
      await this.stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

    const plan = await this.planRepository.findOne({
      where: { stripePriceId: priceId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const {
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      canceled_at,
      metadata,
    } = stripeSub as any;

    const subscription = this.subscriptionRepository.create({
      stripeSubscriptionId: stripeSub.id,
      user,
      plan,
      status: stripeSub.status,
      currentPeriodStart: new Date((current_period_start ?? 0) * 1000),
      currentPeriodEnd: new Date((current_period_end ?? 0) * 1000),
      cancelAtPeriodEnd: cancel_at_period_end ?? false,
      canceledAt: canceled_at ? new Date(canceled_at * 1000) : undefined,
      metadata,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async createSubscriptionWithElements(
    userId: string,
    priceId: string,
    paymentMethodId: string,
  ) {
    let user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
      });
      user.stripeCustomerId = customer.id;
      await this.userRepository.save(user);
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    await this.stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const stripeSub: Stripe.Subscription =
      await this.stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

    const plan = await this.planRepository.findOne({
      where: { stripePriceId: priceId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const {
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      canceled_at,
      metadata,
    } = stripeSub as any;

    const subscription = this.subscriptionRepository.create({
      stripeSubscriptionId: stripeSub.id,
      user,
      plan,
      status: stripeSub.status,
      currentPeriodStart: new Date((current_period_start ?? 0) * 1000),
      currentPeriodEnd: new Date((current_period_end ?? 0) * 1000),
      cancelAtPeriodEnd: cancel_at_period_end ?? false,
      canceledAt: canceled_at ? new Date(canceled_at * 1000) : undefined,
      metadata,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionById(id: string) {
    return this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });
  }

  async getSubscriptionsByUser(userId: string) {
    return this.subscriptionRepository.find({
      where: { user: { id: userId } },
      relations: ['plan'],
    });
  }

  async upgradeSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const stripeSubData: Stripe.Subscription =
      await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );
    const itemId = stripeSubData.items.data[0]?.id;
    if (!itemId) throw new NotFoundException('Subscription item not found');

    const stripeSub: Stripe.Subscription =
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{ id: itemId, price: newPriceId }],
          proration_behavior: 'create_prorations',
        },
      );

    const plan = await this.planRepository.findOne({
      where: { stripePriceId: newPriceId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const {
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      canceled_at,
      metadata,
    } = stripeSub as any;

    subscription.plan = plan;
    subscription.status = stripeSub.status;
    subscription.currentPeriodStart = new Date(
      (current_period_start ?? 0) * 1000,
    );
    subscription.currentPeriodEnd = new Date((current_period_end ?? 0) * 1000);
    subscription.cancelAtPeriodEnd = cancel_at_period_end ?? false;
    subscription.canceledAt = canceled_at
      ? new Date(canceled_at * 1000)
      : undefined;
    subscription.metadata = metadata;
    return this.subscriptionRepository.save(subscription);
  }

  // Downgrade: schedule for next period
  async downgradeSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const stripeSubData: Stripe.Subscription =
      await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );
    const itemId = stripeSubData.items.data[0]?.id;
    if (!itemId) throw new NotFoundException('Subscription item not found');

    const stripeSub: Stripe.Subscription =
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{ id: itemId, price: newPriceId }],
          proration_behavior: 'none',
          cancel_at_period_end: false,
        },
      );

    const plan = await this.planRepository.findOne({
      where: { stripePriceId: newPriceId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    subscription.metadata = {
      ...subscription.metadata,
      scheduledDowngradeTo: newPriceId,
    };
    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    return this.subscriptionRepository.save(subscription);
  }

  async createCheckoutSession(user: any, priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: user.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:
        process.env.STRIPE_SUCCESS_URL ||
        'https://your-app.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:
        process.env.STRIPE_CANCEL_URL || 'https://your-app.com/cancel',
    });
    return session;
  }
}
