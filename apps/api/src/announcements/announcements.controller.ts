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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
import { AnnouncementsService } from './announcements.service.js';
import { AnnouncementQueryDto } from './dto/announcement-query.dto.js';
import {
  AnnouncementListResponseDto,
  AnnouncementResponseDto,
} from './dto/announcement-response.dto.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({
    operationId: 'listAnnouncements',
    summary: 'List announcements',
    description:
      'Supports full-text search over title and body, ANY-match category filtering and pagination. Always ordered by lastUpdate descending.',
  })
  @ApiOkResponse({ type: AnnouncementListResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto, description: 'Invalid query parameters' })
  async listAnnouncements(
    @Query() query: AnnouncementQueryDto,
  ): Promise<AnnouncementListResponseDto> {
    const result = await this.announcementsService.list({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
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
  @ApiOperation({ operationId: 'getAnnouncement', summary: 'Get a single announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AnnouncementResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Announcement does not exist' })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto, description: 'Malformed id' })
  async getAnnouncement(@Param('id', ParseUUIDPipe) id: string): Promise<AnnouncementResponseDto> {
    return AnnouncementResponseDto.from(await this.announcementsService.getById(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createAnnouncement',
    summary: 'Create an announcement',
    description:
      'Requires at least one existing category. lastUpdate is server-managed and cannot be supplied.',
  })
  @ApiCreatedResponse({ type: AnnouncementResponseDto })
  @ApiBadRequestResponse({
    type: ApiErrorResponseDto,
    description: 'Validation failed or a referenced category does not exist',
  })
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
  @ApiOperation({
    operationId: 'updateAnnouncement',
    summary: 'Update an announcement',
    description:
      'Partial update. Providing categoryIds replaces the whole category set; every update refreshes lastUpdate.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AnnouncementResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Announcement does not exist' })
  @ApiBadRequestResponse({
    type: ApiErrorResponseDto,
    description: 'Validation failed or a referenced category does not exist',
  })
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
  @ApiOperation({ operationId: 'deleteAnnouncement', summary: 'Delete an announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Announcement deleted' })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Announcement does not exist' })
  async deleteAnnouncement(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.announcementsService.delete(id);
  }
}
