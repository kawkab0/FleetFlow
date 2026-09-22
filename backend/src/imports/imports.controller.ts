import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImportsService } from './imports.service';

type UploadedImportFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
  ) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  preview(@UploadedFile() file: UploadedImportFile) {
    return this.importsService.previewFile(file);
  }

  @Post('vehicles')
  importVehicles(
    @Body() body: { rows: Record<string, unknown>[] },
  ) {
    return this.importsService.importVehicles(body.rows);
  }
}
