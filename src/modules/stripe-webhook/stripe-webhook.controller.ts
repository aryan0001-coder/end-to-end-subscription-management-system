import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeWebhookService } from './stripe-webhook.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeController,
} from '@nestjs/swagger';

@ApiTags('webhook')
@ApiExcludeController()
@Controller('webhook')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  /**
   * Stripe webhook endpoint (POST /webhook)
   * Receives and verifies Stripe events, then delegates to the service for processing
   */
  @Post()
  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description: 'Receives Stripe webhook events',
    deprecated: false,
  })
  @ApiResponse({ status: 200, description: 'Webhook received.' })
  @ApiResponse({ status: 400, description: 'Webhook error.' })
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    try {
      await this.webhookService.handleEvent(req, sig);
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
