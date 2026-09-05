import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { AnnouncementsService } from './announcements.service.js';
import {
  AnnouncementListResponseDto,
  AnnouncementResponseDto,
} from './dto/announcement-response.dto.js';
import { AnnouncementQueryDto } from './dto/announcement-query.dto.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async listAnnouncements(
    @Query() query: AnnouncementQueryDto
  ): Promise<AnnouncementListResponseDto> {
    const result = await this.announcementsService.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
      categoryIds: query.categoryIds,
    });

    return {
      items: result.items.map((item) => AnnouncementResponseDto.from(item)),
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  @Get(':id')
  async getAnnouncement(@Param('id', ParseUUIDPipe) id: string): Promise<AnnouncementResponseDto> {
    return AnnouncementResponseDto.from(await this.announcementsService.getById(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAnnouncement(@Body() dto: CreateAnnouncementDto): Promise<AnnouncementResponseDto> {
    const announcement = await this.announcementsService.create({
      title: dto.title,
      body: dto.body,
      publicationDate: new Date(dto.publicationDate),
      categoryIds: dto.categoryIds,
    });
    return AnnouncementResponseDto.from(announcement);
  }

  @Patch(':id')
  async updateAnnouncement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    const announcement = await this.announcementsService.update(id, {
      title: dto.title,
      body: dto.body,
      publicationDate:
        dto.publicationDate !== undefined ? new Date(dto.publicationDate) : undefined,
      categoryIds: dto.categoryIds,
    });
    return AnnouncementResponseDto.from(announcement);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnnouncement(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.announcementsService.delete(id);
  }
}
