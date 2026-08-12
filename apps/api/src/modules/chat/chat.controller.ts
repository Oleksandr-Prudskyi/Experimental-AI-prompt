import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '@evidence/shared';

@Controller('api/v1/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('channels')
  getChannels(@CurrentUser('id') userId: string) {
    return this.chatService.getChannels(userId);
  }

  @Post('channels/direct')
  getOrCreateDirect(
    @Body('userId') otherUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getOrCreateDirectChannel(userId, otherUserId);
  }

  @Post('channels/group')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CHAT_CREATE_CHANNEL)
  createGroup(
    @Body() body: { name: string; memberIds: string[] },
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.createGroupChannel(body.name, userId, body.memberIds);
  }

  @Post('channels/department')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CHAT_CREATE_CHANNEL)
  createDepartment(
    @Body('workshopId') workshopId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.createDepartmentChannel(workshopId, userId);
  }

  @Get('channels/:id/messages')
  getMessages(
    @Param('id') channelId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getMessages(channelId, userId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('channels/:id/messages')
  sendMessage(
    @Param('id') channelId: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.sendMessage(channelId, userId, content);
  }

  @Post('channels/:id/read')
  markRead(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markRead(channelId, userId);
  }

  @Post('channels/:id/members')
  addMembers(
    @Param('id') channelId: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.chatService.addMembers(channelId, userIds);
  }

  @Delete('channels/:id/members/me')
  leaveChannel(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.leaveChannel(channelId, userId);
  }
}
