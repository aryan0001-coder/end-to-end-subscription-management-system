import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription } from '../../entities/susbscription.entity';
import { Plan } from '../../entities/plan.entity';
import { Refund } from '../../entities/refund.entity';
import { SubscriptionEvent } from '../../entities/subscription-event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../../entities/user.entity';


@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(SubscriptionEvent)
    private readonly eventRepository: Repository<SubscriptionEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {
    // Initialize Stripe client with secret key
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * Verifies and processes a Stripe webhook event
   * Saves event to DB, updates subscriptions/plans/refunds, and sends notifications as needed
   */
  async handleEvent(req: any, sig: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = this.stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret,
    );

    
    await this.eventRepository.save({
      subscription: undefined,
      eventType: event.type,
      eventData: event.data,
    });

   
    switch (event.type) {
      case 'checkout.session.completed': {
      
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        const stripeSub =
          await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

        const user = await this.userRepository.findOne({
          where: { stripeCustomerId },
        });
        if (!user) break;

        const priceId = stripeSub.items.data[0].price.id;
        const plan = await this.planRepository.findOne({
          where: { stripePriceId: priceId },
        });
        if (!plan) break;

        let localSub = await this.subscriptionRepository.findOne({
          where: { stripeSubscriptionId },
        });
        if (!localSub) {
          
          localSub = this.subscriptionRepository.create({
            stripeSubscriptionId,
            user,
            plan,
            status: stripeSub.status,
            currentPeriodStart: new Date(
              ((stripeSub as any).current_period_start ?? 0) * 1000,
            ),
            currentPeriodEnd: new Date(
              ((stripeSub as any).current_period_end ?? 0) * 1000,
            ),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
            canceledAt: stripeSub.canceled_at
              ? new Date(stripeSub.canceled_at * 1000)
              : undefined,
            metadata: stripeSub.metadata,
          });
          await this.subscriptionRepository.save(localSub);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
      
        const invoice = event.data.object as any;
        const subscription = await this.subscriptionRepository.findOne({
          where: {
            stripeSubscriptionId: (invoice.subscription ?? '') as string,
          },
          relations: ['user'],
        });
        const userEmail = subscription?.user?.email;
        if (userEmail) {
          await this.notificationsService.sendMail(
            userEmail,
            'Payment Successful',
            'Your payment was successful!',
            '<b>Your payment was successful!</b>',
          );
        }
        break;
      }
      case 'charge.refunded': {
        
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
       
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const localSub = await this.subscriptionRepository.findOne({
          where: { stripeSubscriptionId: subscriptionObj.id },
        });
        if (localSub) {
          localSub.status = subscriptionObj.status;
          localSub.currentPeriodStart = new Date(
            ((subscriptionObj as any).current_period_start ?? 0) * 1000,
          );
          localSub.currentPeriodEnd = new Date(
            ((subscriptionObj as any).current_period_end ?? 0) * 1000,
          );
          localSub.cancelAtPeriodEnd =
            subscriptionObj.cancel_at_period_end ?? false;
          localSub.canceledAt = subscriptionObj.canceled_at
            ? new Date(subscriptionObj.canceled_at * 1000)
            : undefined;
          localSub.metadata = subscriptionObj.metadata as any;
          await this.subscriptionRepository.save(localSub);
        }
        break;
      }
      case 'price.created':
      case 'price.updated':
      case 'price.deleted': {
        
        const priceObj = event.data.object as Stripe.Price;
        let name = '';
        if (
          typeof priceObj.product === 'object' &&
          'name' in priceObj.product
        ) {
          name = priceObj.product.name;
        }
        await this.planRepository.upsert(
          {
            stripePriceId: priceObj.id,
            name,
            amount: priceObj.unit_amount ?? 0,
            currency: priceObj.currency,
            interval: priceObj.recurring?.interval ?? '',
            metadata: priceObj.metadata
              ? ({ ...priceObj.metadata } as any)
              : {},
          },
          ['stripePriceId'],
        );
        break;
      }
      case 'refund.updated': {
       
        const refund = event.data.object as Stripe.Refund;
        const localRefund = await this.refundRepository.findOne({
          where: { stripeRefundId: String(refund.id || '') },
          relations: ['subscription', 'subscription.user'],
        });
        const userEmail = localRefund?.subscription?.user?.email;
        if (userEmail) {
          await this.notificationsService.sendMail(
            userEmail,
            'Payment Refunded',
            'Your payment has been refunded. If you have any questions, please contact support.',
            '<b>Your payment has been refunded. If you have any questions, please contact support.</b>',
          );
        }
        if (localRefund) {
          localRefund.amount = refund.amount;
          localRefund.status = refund.status ?? '';
          await this.refundRepository.save(localRefund);
        } else {
          await this.refundRepository.save({
            stripeRefundId: String(refund.id || ''),
            amount: refund.amount,
            status: refund.status ?? '',
            createdAt: new Date(
              (refund.created ?? Math.floor(Date.now() / 1000)) * 1000,
            ),
            subscription: undefined,
          });
        }
        break;
      }
    }
  }
}
