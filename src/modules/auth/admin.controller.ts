import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('users')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      example: [
        {
          id: 'uuid',
          email: 'user@example.com',
          username: 'john_doe',
          role: 'user',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers() {
    const users = await this.userRepository.find({
      select: [
        'id',
        'email',
        'username',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
        'stripeCustomerId',
      ],
    });

    return users;
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System statistics',
    schema: {
      example: {
        totalUsers: 100,
        activeUsers: 85,
        adminUsers: 3,
        totalSubscriptions: 75,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemStats() {
    const [totalUsers, activeUsers, adminUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { role: 'admin' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,

      totalSubscriptions: 0,
    };
  }
}
