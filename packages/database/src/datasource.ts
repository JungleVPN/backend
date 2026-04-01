import path from 'node:path';
import * as process from 'node:process';
import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { StripePayment } from './entities/stripe-payment.entity';
import { YookassaPayment } from './entities/yookassa-payment.entity';

// Walk up from cwd to find the root .env (works from any apps/* directory)
config({
  path: [path.resolve(process.cwd(), '../../.env')],
});

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  port: Number(process.env.POSTGRES_PORT),
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [StripePayment, YookassaPayment],
  migrations: ['dist/migrations/**/*.js'],
  migrationsRun: true,
  synchronize: process.env.NODE_ENV === 'dev',
  logging: process.env.NODE_ENV === 'dev',
};

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();

export default dataSource;
