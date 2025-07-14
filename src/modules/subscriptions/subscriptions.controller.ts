import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ChangeSubscriptionPlanDto } from './dto/change-subscription-plan.dto';
import { UsersService } from '../users/users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a Stripe Checkout session for the authenticated user (redirect flow)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('checkout-session')
  @ApiOperation({
    summary: 'Create a Stripe Checkout session for the authenticated user',
  })
  @ApiBody({
    schema: {
      properties: {
        priceId: { type: 'string', description: 'Stripe price ID' },
      },
      required: ['priceId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: 'Price ID is required',
        error: 'Bad Request',
      },
    },
  })
  async createCheckoutSession(
    @Body() body: { priceId: string },
    @Request() req,
  ) {
    const session = await this.subscriptionsService.createCheckoutSession(
      req.user,
      body.priceId,
    );
    return { url: session.url };
  }

  /**
   * Create a subscription using Stripe Elements and Direct API for the authenticated user
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('elements-subscribe')
  @ApiOperation({
    summary:
      'Create a subscription using Stripe Elements and Direct API for the authenticated user',
  })
  @ApiBody({
    schema: {
      properties: {
        priceId: { type: 'string', description: 'Stripe price ID' },
        paymentMethodId: {
          type: 'string',
          description: 'Stripe payment method ID',
        },
      },
      required: ['priceId', 'paymentMethodId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created.',
    schema: {
      example: {
        id: 'uuid',
        stripeSubscriptionId: 'sub_123',
        user: { id: 'uuid', email: 'user@example.com' },
        plan: { id: 1, name: 'Pro' },
        status: 'active',
        currentPeriodStart: '2024-07-11T00:00:00.000Z',
        currentPeriodEnd: '2024-08-11T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        canceledAt: null,
        metadata: {},
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: ['priceId must be a string'],
        error: 'Bad Request',
      },
    },
  })
  async createSubscriptionWithElements(
    @Body() body: { priceId: string; paymentMethodId: string },
    @Request() req,
  ) {
    return this.subscriptionsService.createSubscriptionWithElements(
      req.user.id,
      body.priceId,
      body.paymentMethodId,
    );
  }
  /**
   * Get a subscription by its internal UUID (users can only access their own subscriptions)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('sub/:id')
  @ApiOperation({
    summary:
      'Get subscription by ID (users can only access their own subscriptions)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription found.',
    schema: {
      example: {
        id: 'uuid',
        stripeSubscriptionId: 'sub_123',
        user: { id: 'uuid', email: 'user@example.com' },
        plan: { id: 1, name: 'Pro' },
        status: 'active',
        currentPeriodStart: '2024-07-11T00:00:00.000Z',
        currentPeriodEnd: '2024-08-11T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        canceledAt: null,
        metadata: {},
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Subscription not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subscription not found',
        error: 'Not Found',
      },
    },
  })
  async getSubscription(@Param('id') id: string, @Request() req) {
    const subscription =
      await this.subscriptionsService.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns this subscription or is admin
    if (subscription.user.id !== req.user.id && req.user.role !== 'admin') {
      throw new Error(
        'Access denied: You can only access your own subscriptions',
      );
    }

    return subscription;
  }

  /**
   * Get all subscriptions for the authenticated user
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('my-subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions.',
    schema: {
      example: [
        {
          id: 'uuid',
          stripeSubscriptionId: 'sub_123',
          plan: { id: 1, name: 'Pro' },
          status: 'active',
        },
      ],
    },
  })
  async getMySubscriptions(@Request() req) {
    return this.subscriptionsService.getSubscriptionsByUser(req.user.id);
  }

  /**
   * Get all subscriptions for a specific user (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('user/:userId')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all subscriptions for a specific user (admin only)',
  })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions.',
    schema: {
      example: [
        {
          id: 'uuid',
          stripeSubscriptionId: 'sub_123',
          plan: { id: 1, name: 'Pro' },
          status: 'active',
        },
      ],
    },
  })
  async getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.getSubscriptionsByUser(userId);
  }

  /**
   * Upgrade a subscription to a new plan (immediate/prorated) - users can only upgrade their own subscriptions
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Patch(':id/upgrade')
  @ApiOperation({
    summary:
      'Upgrade a subscription (users can only upgrade their own subscriptions)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ChangeSubscriptionPlanDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded.',
    schema: {
      example: { id: 'uuid', status: 'active', plan: { id: 1, name: 'Pro' } },
    },
  })
  @ApiNotFoundResponse({
    description: 'Subscription not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subscription not found',
        error: 'Not Found',
      },
    },
  })
  async upgrade(
    @Param('id') id: string,
    @Body() body: ChangeSubscriptionPlanDto,
    @Request() req,
  ) {
    const subscription =
      await this.subscriptionsService.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns this subscription or is admin
    if (subscription.user.id !== req.user.id && req.user.role !== 'admin') {
      throw new Error(
        'Access denied: You can only modify your own subscriptions',
      );
    }

    return this.subscriptionsService.upgradeSubscription(id, body.newPriceId);
  }

  /**
   * Downgrade a subscription to a new plan (scheduled for next period) - users can only downgrade their own subscriptions
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Patch(':id/downgrade')
  @ApiOperation({
    summary:
      'Downgrade a subscription (users can only downgrade their own subscriptions)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: ChangeSubscriptionPlanDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription downgraded.',
    schema: {
      example: { id: 'uuid', status: 'active', plan: { id: 1, name: 'Basic' } },
    },
  })
  @ApiNotFoundResponse({
    description: 'Subscription not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subscription not found',
        error: 'Not Found',
      },
    },
  })
  async downgrade(
    @Param('id') id: string,
    @Body() body: ChangeSubscriptionPlanDto,
    @Request() req,
  ) {
    console.log('1');
    const subscription =
      await this.subscriptionsService.getSubscriptionById(id);
    console.log('2');
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns this subscription or is admin
    if (subscription.user.id !== req.user.id && req.user.role !== 'admin') {
      throw new Error(
        'Access denied: You can only modify your own subscriptions',
      );
    }

    return this.subscriptionsService.downgradeSubscription(id, body.newPriceId);
  }

  /**
   * Cancel a subscription immediately - users can only cancel their own subscriptions
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete(':id/cancel')
  @ApiOperation({
    summary:
      'Cancel a subscription (users can only cancel their own subscriptions)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled.',
    schema: { example: { id: 'uuid', status: 'canceled' } },
  })
  @ApiNotFoundResponse({
    description: 'Subscription not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subscription not found',
        error: 'Not Found',
      },
    },
  })
  async cancel(@Param('id') id: string, @Request() req) {
    const subscription =
      await this.subscriptionsService.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.user.id !== req.user.id && req.user.role !== 'admin') {
      throw new Error(
        'Access denied: You can only cancel your own subscriptions',
      );
    }

    return this.subscriptionsService.cancelSubscription(id);
  }
}
