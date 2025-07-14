import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-user-id' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'price_1Hh1Y2G2eZvKYlo2C0qQ' })
  @IsString()
  priceId: string;
}
