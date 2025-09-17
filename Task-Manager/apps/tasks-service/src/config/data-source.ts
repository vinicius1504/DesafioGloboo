import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'tasks_db',
  entities: [Task, Comment, User],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  // Connection options for better reliability
  extra: {
    // Connection timeout and retry options
    connectionTimeoutMillis: 60000,
    query_timeout: 60000,
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 60000,
    // Retry on connection failure
    retryOnExit: true,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;