import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeSubscriptionPlanDto {
  @ApiProperty({ example: 'price_1Hh1Y2G2eZvKYlo2C0qQ' })
  @IsString()
  newPriceId: string;
}
