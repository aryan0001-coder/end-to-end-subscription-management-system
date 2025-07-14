import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({
    example: 'pi_1Hh1Y2G2eZvKYlo2C0qQ',
    description: 'Stripe PaymentIntent ID',
  })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    example: 500,
    required: false,
    description: 'Amount to refund in cents (optional, defaults to full)',
  })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
