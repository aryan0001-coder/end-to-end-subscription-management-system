import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/susbscription.entity';
import { Plan } from '../../entities/plan.entity';
import { Refund } from '../../entities/refund.entity';
import { SubscriptionEvent } from '../../entities/subscription-event.entity';
import { User } from '../../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Plan,
      Refund,
      SubscriptionEvent,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class StripeWebhookModule {}
