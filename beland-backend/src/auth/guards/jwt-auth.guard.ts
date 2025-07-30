import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseActivation = await super.canActivate(context);
    if (!baseActivation) return false;

    const request = context.switchToHttp().getRequest();
    const dbUser = request.user;

    if (!dbUser || dbUser.deleted_at || dbUser.isBlocked) {
      throw new UnauthorizedException('User account status invalid.');
    }

    return true;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(info?.message || 'Authentication failed')
      );
    }
    return user;
  }
}
