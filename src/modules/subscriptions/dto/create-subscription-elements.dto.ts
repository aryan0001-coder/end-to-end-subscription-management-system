import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionElementsDto {
  @ApiProperty({ example: 'price_1Hh1Y2G2eZvKYlo2C0qQ' })
  @IsString()
  priceId: string;

  @ApiProperty({ example: 'pm_1Hh1Y2G2eZvKYlo2C0qQ' })
  @IsString()
  paymentMethodId: string;
}
