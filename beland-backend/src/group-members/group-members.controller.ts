import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupMembersService } from './group-members.service';
import { GroupMember } from './entities/group-member.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { Request } from 'express';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';

@ApiTags('group_members')
@Controller('group_members')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class GroupMembersController {
  constructor(private readonly service: GroupMembersService) {}

  @Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Listar miembros de grupo con paginación y filtro exclusivo' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
@ApiQuery({ name: 'group_id', required: false, type: String, description: 'Filtrar por ID de grupo.' })
@ApiResponse({ status: 200, description: 'Listado de miembros retornado correctamente' })
@ApiResponse({ status: 400, description: 'Solo puede enviarse user_id o group_id, no ambos.' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Req() req: Request,
  @Query('group_id') group_id = '',
): Promise<[GroupMember[], number]> {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  return await this.service.findAll(group_id, pageNumber, limitNumber);
}

@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener un miembro de grupo por su ID' })
@ApiParam({ name: 'id', description: 'UUID del miembro de grupo' })
@ApiResponse({ status: 200, description: 'Miembro de grupo encontrado' })
@ApiResponse({ status: 404, description: 'No se encontró el miembro de grupo' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GroupMember> {
  return await this.service.findOne(id);
}

@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Crear un nuevo miembro de grupo' })
@ApiResponse({ status: 201, description: 'Miembro creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos para crear el miembro' })
@ApiResponse({ status: 500, description: 'Error al crear el miembro' })
async create(@Body() body: CreateGroupMemberDto): Promise<GroupMember> {
  return await this.service.create(body);
}

@Put(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Actualizar un miembro de grupo existente' })
@ApiParam({ name: 'id', description: 'UUID del miembro de grupo a actualizar' })
@ApiResponse({ status: 200, description: 'Miembro de grupo actualizado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el miembro a actualizar' })
@ApiResponse({ status: 500, description: 'Error al actualizar el miembro' })
async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateGroupMemberDto) {
  return this.service.update(id, body);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Eliminar un miembro de grupo por su ID' })
@ApiParam({ name: 'id', description: 'UUID del miembro de grupo a eliminar' })
@ApiResponse({ status: 204, description: 'Miembro de grupo eliminado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el miembro a eliminar' })
@ApiResponse({ status: 409, description: 'No se puede eliminar el miembro (conflicto)' })
async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
  await this.service.remove(id);
}

}
