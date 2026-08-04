import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  findAll(@Query('entity_type') entityType: string, @Query('entity_id') entityId: string) {
    return this.commentsService.findAll(entityType, entityId);
  }

  @Post()
  create(
    @Body() body: { entityType: string; entityId: string; content: string },
    @CurrentUser('id') authorId: string,
  ) {
    return this.commentsService.create(body, authorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('content') content: string, @CurrentUser('id') userId: string) {
    return this.commentsService.update(id, content, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
