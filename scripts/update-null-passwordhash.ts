import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function updateNullPasswordHash() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'subscription_management',
    entities: [User],
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Generate a placeholder password hash for empty password
  const placeholderHash = await bcrypt.hash('defaultPassword123', 12);

  // Update users with null passwordHash
  await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ passwordHash: placeholderHash })
    .where('passwordHash IS NULL')
    .execute();

  console.log('Updated users with null passwordHash to placeholder hash.');

  await dataSource.destroy();
}

updateNullPasswordHash().catch((error) => {
  console.error('Error updating null passwordHash:', error);
  process.exit(1);
});
