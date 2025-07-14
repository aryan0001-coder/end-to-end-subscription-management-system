import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('refunds')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a refund' })
  @ApiBody({ type: CreateRefundDto })
  @ApiResponse({ status: 201, description: 'Refund created.' })
  async createRefund(@Body() body: CreateRefundDto) {
    return this.refundsService.createRefund(body.paymentIntentId, body.amount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund by DB ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Refund found.' })
  async getRefund(@Param('id') id: number) {
    return this.refundsService.getRefundById(id);
  }

  @Get('stripe/:stripeRefundId')
  @ApiOperation({ summary: 'Get refund by Stripe refund ID' })
  @ApiParam({ name: 'stripeRefundId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Refund found.' })
  async getRefundByStripeId(@Param('stripeRefundId') stripeRefundId: string) {
    return this.refundsService.getRefundByStripeId(stripeRefundId);
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get refunds by subscription ID' })
  @ApiParam({ name: 'subscriptionId', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of refunds.' })
  async getRefundsBySubscription(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.refundsService.getRefundsBySubscription(subscriptionId);
  }
}
