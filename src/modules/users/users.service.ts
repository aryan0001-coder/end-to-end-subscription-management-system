import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import Stripe from 'stripe';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * Create a new user and corresponding Stripe customer
   */
  async createUser(email: string, username: string): Promise<User> {
    const user = this.userRepository.create({ email, username });
    const savedUser = await this.userRepository.save(user);

    return this.createStripeCustomerIfNotExists(savedUser);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get a user by their internal UUID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Update a user's email or username
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    return this.userRepository.save(user);
  }

  /**
   * Delete a user by their internal UUID
   */
  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Create a Stripe customer for the user if not already present
   */
  async createStripeCustomerIfNotExists(user: User): Promise<User> {
    if (user.stripeCustomerId) return user;
    const customer = await this.stripe.customers.create({ email: user.email });
    user.stripeCustomerId = customer.id;
    return this.userRepository.save(user);
  }
}
