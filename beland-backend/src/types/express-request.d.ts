import { User } from 'src/users/entities/users.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}