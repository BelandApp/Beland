import { Repository, DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm'; // Importar InjectRepository si se usa

@Injectable()
export class RolesRepository extends Repository<Role> {
  // RolesRepository ahora hereda directamente de Repository<Role>
  // y usa InjectRepository para obtener la instancia del repositorio de TypeORM.
  // Los métodos save, create, find, remove, etc., se heredan automáticamente.
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private dataSource: DataSource, // Se mantiene DataSource si se usa para transacciones o query builders
  ) {
    super(Role, dataSource.manager); // Llamar al constructor de la clase base
  }

  async findByName(
    name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
    manager?: EntityManager,
  ): Promise<Role | null> {
    const repo = manager ? manager.getRepository(Role) : this.roleRepository; // Usar this.roleRepository
    return repo.findOne({ where: { name } });
  }

  async findUsersByRoleId(roleId: string): Promise<User[]> {
    const role = await this.roleRepository.findOne({
      where: { role_id: roleId },
    });
    if (!role) {
      return [];
    }
    return this.dataSource.getRepository(User).find({
      where: { role_name: role.name },
    });
  }

  // Puedes añadir métodos personalizados aquí si necesitas lógica que no sea un simple CRUD
  // Por ejemplo, si necesitas un método que haga algo más complejo que un simple findOne o save.
  // Sin embargo, los métodos básicos como save(), create(), find(), remove() ya se heredan.
}
