import path from 'node:path';
import * as process from 'node:process';
import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { StripePayment } from './entities/stripe-payment.entity';
import { YookassaPayment } from './entities/yookassa-payment.entity';

// Load .env from multiple possible locations.
// In Docker, env vars are injected directly — dotenv is a no-op.
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '../../.env') });

const migrationsDir = path.join(__dirname, 'migrations', '*.js');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  host: process.env.POSTGRES_HOST || 'localhost',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Referral, StripePayment, YookassaPayment],
  migrations: [migrationsDir],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// Default export is what TypeORM CLI expects.
// It is NOT initialized eagerly — call .initialize() yourself when needed.
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
