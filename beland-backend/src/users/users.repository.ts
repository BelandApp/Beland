import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";


export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async createInitialUser(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }


  async findAll(page: number = 1, limit: number = 10) {
    let users = await this.usersRepository.find()

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + +limit

    users = users.slice(startIndex, endIndex)
    return users
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
        where: { id }, 
        relations: {
          orders: true,
        },
      })
      if (!user) {
        return 'Usuario no encontrado'
      }
      return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      return 'Usuario no encontrado'
    }
    return await this.usersRepository.save({ ...user, ...updateUserDto })
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      return 'Usuario no encontrado'
    }
    return await this.usersRepository.remove(user)
  }
}