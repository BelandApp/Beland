import { Repository, DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/users.entity'; // Importar User si se usa en findUsersByRoleId

// Definición de tipo para todos los roles válidos (debe coincidir con UsersService y Role Entity)
type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCE' | 'FUNDATION';

@Injectable()
export class RolesRepository {
  private readonly logger = new Logger(RolesRepository.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleORMRepository: Repository<Role>, // Inyectar directamente el repositorio de TypeORM
    // private dataSource: DataSource, // DataSource solo si necesitas transacciones manuales o query builders complejos
  ) {
    // Si inyectas Repository<Role>, no necesitas llamar a super()
    // super(Role, dataSource.manager);
  }

  // Métodos CRUD básicos se obtienen de roleORMRepository
  async findOne(id: string): Promise<Role | null> {
    return this.roleORMRepository.findOne({ where: { role_id: id } });
  }

  async findByName(name: ValidRoleNames): Promise<Role | null> {
    return this.roleORMRepository.findOne({ where: { name } });
  }

  async save(role: Role): Promise<Role> {
    return this.roleORMRepository.save(role);
  }

  // CORRECCIÓN: Este método debe ser SÍNCRONO y devolver Role directamente.
  // El método .create() de TypeORM es síncrono y solo instancia la entidad.
  create(rolePartial: Partial<Role>): Role {
    return this.roleORMRepository.create(rolePartial);
  }

  async remove(role: Role): Promise<Role> {
    return this.roleORMRepository.remove(role);
  }

  async find(): Promise<Role[]> {
    return this.roleORMRepository.find();
  }

  // Si findUsersByRoleId necesita DataSource, se puede inyectar y usar:
  // async findUsersByRoleId(roleId: string): Promise<User[]> {
  //   const role = await this.roleORMRepository.findOne({
  //     where: { role_id: roleId },
  //   });
  //   if (!role) {
  //     return [];
  //   }
  //   // Asumiendo que tienes un UserRepository o acceso al manager para User
  //   // return this.dataSource.getRepository(User).find({
  //   //   where: { role_name: role.name },
  //   // });
  //   // Si no, esta lógica debería estar en UsersService o UserRepository
  //   throw new Error('findUsersByRoleId not implemented in RolesRepository without DataSource');
  // }
}
