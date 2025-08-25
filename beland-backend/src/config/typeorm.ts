import 'dotenv/config';
import { DataSource } from 'typeorm';

const isTs = process.env.NODE_ENV !== 'production';

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any || 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [isTs ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js'],
  migrations: [isTs ? 'src/database/migrations/*.ts' : 'dist/database/migrations/*.js'],
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
});

//export default registerAs('typeorm', () => config);
//export const connectionSource = new DataSource(config as DataSourceOptions);
