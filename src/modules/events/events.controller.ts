import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription events' })
  @ApiResponse({ status: 200, description: 'List of events.' })
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get events by subscription ID' })
  @ApiParam({ name: 'subscriptionId', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of events for subscription.' })
  async getEventsBySubscription(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.eventsService.getEventsBySubscription(subscriptionId);
  }
}
