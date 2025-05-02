import { Body, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private User: UsersService) {}

    @Get('all')
    @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
    @ApiResponse({ status: 200, description: 'Liste de tous les utilisateurs.' })
    @ApiResponse({ status: 404, description: 'Aucun utilisateur trouvé.' })
    @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
    async getAllUsers() {
        return this.User.findAllUsers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
    @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
    @ApiResponse({ status: 400, description: 'ID invalide.' })
    async getUserById(@Param('id') id: string) {
        return this.User.findUserById(id);
    }

    @Get('delete/:id')
    @ApiOperation({ summary: 'Supprimer un utilisateur par ID' })
    @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
    @ApiResponse({ status: 400, description: 'ID invalide.' })
    async deleteUser(@Param('id') id: string) {
        return this.User.deleteUser(id);
    }
    @Get('update/:id')
    @ApiOperation({ summary: 'Mettre à jour un utilisateur par ID' })
    @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
    @ApiResponse({ status: 400, description: 'ID ou info invalide.' })
    async updateUser(@Param('id') id: string, @Body() body: any) {
        return this.User.updateUser(id, body);
}

}
