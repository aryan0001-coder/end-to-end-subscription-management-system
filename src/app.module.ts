import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/susbscription.entity';
import { Refund } from './entities/refund.entity';
import { SubscriptionEvent } from './entities/subscription-event.entity';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { EventsModule } from './modules/events/events.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { StripeWebhookModule } from './modules/stripe-webhook/stripe-webhook.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    EventsModule,
    RefundsModule,
    StripeWebhookModule,
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      Plan,
      Subscription,
      Refund,
      SubscriptionEvent,
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
