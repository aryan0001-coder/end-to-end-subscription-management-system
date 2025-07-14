import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user and corresponding Stripe customer
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        username: 'username123',
        stripeCustomerId: 'cus_123',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      },
    },
  })
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.usersService.createUser(body.email, body.username);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      stripeCustomerId: user.stripeCustomerId,
    };
  }

  /**
   * Get all users
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users.',
    schema: {
      example: [
        {
          id: 'uuid',
          email: 'user@example.com',
          username: 'username123',
          stripeCustomerId: 'cus_123',
        },
      ],
    },
  })
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      stripeCustomerId: user.stripeCustomerId,
    }));
  }

  /**
   * Get a user by their internal UUID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User found.',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        username: 'username123',
        stripeCustomerId: 'cus_123',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      stripeCustomerId: user.stripeCustomerId,
    };
  }

  /**
   * Update a user's email or username
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated.',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        username: 'username123',
        stripeCustomerId: 'cus_123',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, body);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      stripeCustomerId: user.stripeCustomerId,
    };
  }

  /**
   * Delete a user by their internal UUID
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User deleted.',
    schema: { example: { message: 'User deleted successfully' } },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);
    if (!result) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }
}
