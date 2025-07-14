import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEvent } from '../../entities/subscription-event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(SubscriptionEvent)
    private readonly eventRepository: Repository<SubscriptionEvent>,
  ) {}

  async logEvent(eventType: string, eventData: any, subscriptionId?: string) {
    await this.eventRepository.save({
      eventType,
      eventData,
      subscription: subscriptionId ? { id: subscriptionId } : undefined,
    });
  }

  async getAllEvents() {
    return this.eventRepository.find({ relations: ['subscription'] });
  }

  async getEventsBySubscription(subscriptionId: string) {
    return this.eventRepository.find({
      where: { subscription: { id: subscriptionId } },
      relations: ['subscription'],
    });
  }
}
