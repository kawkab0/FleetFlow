import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from "@nestjs/common";

import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationService.findAll(
      req.user?.id,
    );
  }

  @Get("unread")
  findUnread(@Req() req: any) {
    return this.notificationService.findUnread(
      req.user?.id,
    );
  }

  @Get("count")
  getUnreadCount(@Req() req: any) {
    return this.notificationService.getUnreadCount(
      req.user?.id,
    );
  }

  @Patch(":id/read")
  markAsRead(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.notificationService.markAsRead(id);
  }

  @Patch("read-all")
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(
      req.user?.id,
    );
  }
}
