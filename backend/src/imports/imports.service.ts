import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesService } from '../vehicles/vehicles.service';

type UploadedImportFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

type ImportRow = Record<string, unknown>;

@Injectable()
export class ImportsService {
  constructor(
    private readonly vehiclesService: VehiclesService,
  ) {}

  previewFile(file: UploadedImportFile) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    const extension = file.originalname
      .toLowerCase()
      .split('.')
      .pop();

    // FleetFlow supports all common spreadsheet/table formats.
    const supportedExtensions = ['csv', 'xls', 'xlsx'];

    if (!extension || !supportedExtensions.includes(extension)) {
      throw new BadRequestException(
        'Unsupported file format. Please upload a CSV, XLS, or XLSX file.',
      );
    }

    let workbook: XLSX.WorkBook;

    try {
      workbook = XLSX.read(file.buffer, {
        type: 'buffer',
        cellDates: true,
      });
    } catch {
      throw new BadRequestException(
        'The file could not be read. Please make sure it is a valid CSV, XLS, or XLSX file.',
      );
    }

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new BadRequestException(
        'The uploaded file does not contain a worksheet.',
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<ImportRow>(
      worksheet,
      {
        defval: '',
        raw: false,
      },
    );

    if (rows.length === 0) {
      throw new BadRequestException(
        'The uploaded file does not contain any data rows.',
      );
    }

    return {
      fileName: file.originalname,
      fileType: extension,
      sheetName: firstSheetName,
      rowCount: rows.length,
      columns: Object.keys(rows[0]),
      rows,
    };
  }

  async importVehicles(rows: ImportRow[]) {
    if (!rows || rows.length === 0) {
      throw new BadRequestException(
        'There are no rows to import.',
      );
    }

    const errors: {
      row: number;
      message: string;
    }[] = [];

    const imported: Vehicle[] = [];

    // Load existing vehicles once instead of querying the database
    // for every uploaded row.
    const existingVehicles =
      await this.vehiclesService.findAll();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2;

      const vehicleCode = this.getValue(row, [
        'vehicleCode',
        'vehicle code',
        'vehicle_code',
        'vehiclecode',
        'code',
      ]);

      const registrationNumber = this.getValue(row, [
        'registrationNumber',
        'registration number',
        'registration_number',
        'registrationnumber',
        'registration no',
        'registration_no',
        'reg number',
        'reg no',
      ]);

      const type = this.getValue(row, [
        'type',
        'vehicle type',
        'vehicle_type',
        'vehicletype',
      ]);

      const model = this.getValue(row, [
        'model',
        'vehicle model',
        'vehicle_model',
        'vehiclemodel',
      ]);

      const status =
        this.getValue(row, [
          'status',
          'vehicle status',
          'vehicle_status',
        ]) || 'Available';

      const mileageValue = this.getValue(row, [
        'mileage',
        'mileage km',
        'mileage (km)',
        'mileage_km',
        'kilometers',
        'kilometres',
        'km',
      ]);

      if (!vehicleCode) {
        errors.push({
          row: rowNumber,
          message: 'Vehicle Code is required.',
        });
        continue;
      }

      if (!registrationNumber) {
        errors.push({
          row: rowNumber,
          message: 'Registration Number is required.',
        });
        continue;
      }

      if (!type) {
        errors.push({
          row: rowNumber,
          message: 'Vehicle Type is required.',
        });
        continue;
      }

      if (!model) {
        errors.push({
          row: rowNumber,
          message: 'Model is required.',
        });
        continue;
      }

      let mileage = 0;

      if (mileageValue !== '') {
        mileage = Number(mileageValue);

        if (!Number.isFinite(mileage) || mileage < 0) {
          errors.push({
            row: rowNumber,
            message: 'Mileage must be a non-negative number.',
          });
          continue;
        }
      }

      const duplicate = existingVehicles.find(
        (vehicle) =>
          vehicle.vehicleCode.toLowerCase() ===
            vehicleCode.toLowerCase() ||
          vehicle.registrationNumber.toLowerCase() ===
            registrationNumber.toLowerCase(),
      );

      if (duplicate) {
        errors.push({
          row: rowNumber,
          message:
            'A vehicle with this Vehicle Code or Registration Number already exists.',
        });
        continue;
      }

      try {
        const vehicle = await this.vehiclesService.create(
          {
            vehicleCode,
            registrationNumber,
            type,
            model,
            status,
            mileage,
          },
          {
            userId: 1,
            email: 'import@fleetflow.local',
            role: 'Admin',
          },
        );

        imported.push(vehicle);

        // Also prevent duplicates within the same uploaded file.
        existingVehicles.push(vehicle);
      } catch (error) {
        errors.push({
          row: rowNumber,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to import this row.',
        });
      }
    }

    return {
      success: errors.length === 0,
      importedCount: imported.length,
      errorCount: errors.length,
      imported,
      errors,
    };
  }

  private getValue(
    row: ImportRow,
    possibleNames: string[],
  ): string {
    const normalizedRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      normalizedRow[this.normalizeColumnName(key)] = value;
    }

    for (const name of possibleNames) {
      const value =
        normalizedRow[this.normalizeColumnName(name)];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return String(value).trim();
      }
    }

    return '';
  }

  private normalizeColumnName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }
}
