import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

type UploadedImportFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class ImportsService {
  previewFile(file: UploadedImportFile) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const extension = file.originalname
      .toLowerCase()
      .split('.')
      .pop();

    if (!extension || !['csv', 'xls', 'xlsx'].includes(extension)) {
      throw new BadRequestException(
        'Only CSV, XLS, and XLSX files are supported.',
      );
    }

    if (!allowedTypes.includes(file.mimetype) && extension !== 'csv') {
      throw new BadRequestException(
        'The uploaded file type is not supported.',
      );
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new BadRequestException(
        'The uploaded file does not contain a worksheet.',
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: '',
      },
    );

    return {
      fileName: file.originalname,
      sheetName: firstSheetName,
      rowCount: rows.length,
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rows: rows.slice(0, 20),
    };
  }
}
