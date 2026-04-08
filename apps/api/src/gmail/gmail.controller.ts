import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchEmailsDto } from './dto/search-emails.dto';
import { BulkActionDto } from './dto/bulk-action.dto';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('gmail')
@UseGuards(JwtAuthGuard)
export class GmailController {
  constructor(private gmailService: GmailService) {}

  @Post('search')
  async searchEmails(@Req() req: RequestWithUser, @Body() dto: SearchEmailsDto) {
    return this.gmailService.searchEmails(req.user, dto.sender, dto.from, dto.to);
  }

  @Post('trash')
  async trashEmails(@Req() req: RequestWithUser, @Body() dto: BulkActionDto) {
    return this.gmailService.trashEmails(req.user, dto.ids);
  }

  @Post('delete')
  async deleteEmails(@Req() req: RequestWithUser, @Body() dto: BulkActionDto) {
    return this.gmailService.deleteEmails(req.user, dto.ids);
  }

  @Get('preview/:id')
  async getEmailPreview(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.gmailService.getEmailPreview(req.user, id);
  }
}
