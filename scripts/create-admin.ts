import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import * as bcrypt from 'bcryptjs';

// create-admin.ts - Script to create an admin user for testing
// Run with: npm run create-admin
async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  try {
    // Create admin user
    const adminData = {
      email: 'admin@example.com',
      username: 'admin',
      password: 'AdminPass123!',
    };

    console.log('Creating admin user...');
    const result = await authService.register(adminData);

    // Update role to admin
    const userRepository = app.get('UserRepository');
    await userRepository.update(result.user.id, { role: 'admin' });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('JWT Token:', result.token);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await app.close();
  }
}

createAdmin();
