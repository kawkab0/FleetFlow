import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  maintenanceCode!: string;

  @IsString()
  @IsNotEmpty()
  vehicleCode!: string;

  @IsDateString()
  maintenanceDate!: string;

  @IsString()
  @IsNotEmpty()
  maintenanceType!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  mileage!: number;

  @IsNumber()
  cost!: number;

  @IsString()
  @IsNotEmpty()
  serviceProvider!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
