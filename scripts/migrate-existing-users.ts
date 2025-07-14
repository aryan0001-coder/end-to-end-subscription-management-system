import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import * as bcrypt from 'bcryptjs';

// migrate-existing-users.ts - Script to handle existing users during auth migration
// This script will either set a default password for existing users or mark them as inactive
async function migrateExistingUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));

  try {
    console.log('🔍 Checking for existing users without passwords...');

    // Find users without password hashes
    const usersWithoutPasswords = await userRepository.find({
      where: { passwordHash: null },
    });

    if (usersWithoutPasswords.length === 0) {
      console.log('✅ No users found without passwords. Migration not needed.');
      return;
    }

    console.log(
      `📊 Found ${usersWithoutPasswords.length} users without passwords:`,
    );
    usersWithoutPasswords.forEach((user) => {
      console.log(`  - ${user.email} (${user.username})`);
    });

    console.log('\n🔄 Starting migration...');
    console.log('Options:');
    console.log(
      '1. Set default password for all users (they can change it later)',
    );
    console.log('2. Mark users as inactive (they need to reset password)');
    console.log('3. Skip migration (users will need to be handled manually)');

    // For now, we'll set a default password
    // In production, you might want to mark them as inactive and require password reset
    const defaultPassword = 'ChangeMe123!';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Update all users without passwords
    await userRepository.update(
      { passwordHash: null },
      {
        passwordHash: passwordHash,
        role: 'user', // Set default role
        isActive: true, // Keep them active
      },
    );

    console.log('\n✅ Migration completed successfully!');
    console.log(
      `📝 Default password set for ${usersWithoutPasswords.length} users: "${defaultPassword}"`,
    );
    console.log(
      '⚠️  IMPORTANT: Users should change their passwords on first login!',
    );

    // Show updated users
    const updatedUsers = await userRepository.find({
      where: { passwordHash: passwordHash },
    });

    console.log('\n📋 Updated users:');
    updatedUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.username}) - Role: ${user.role}`);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await app.close();
  }
}

migrateExistingUsers();
