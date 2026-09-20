import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
  ) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  preview(@UploadedFile() file: Express.Multer.File) {
    return this.importsService.previewFile(file);
  }
}
