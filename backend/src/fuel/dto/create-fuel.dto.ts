import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFuelDto {
  @IsString()
  @IsNotEmpty()
  fuelCode!: string;

  @IsString()
  @IsNotEmpty()
  vehicleCode!: string;

  @IsString()
  @IsNotEmpty()
  driverCode!: string;

  @IsDateString()
  fuelDate!: string;

  @IsNumber()
  liters!: number;

  @IsNumber()
  cost!: number;

  @IsString()
  @IsNotEmpty()
  fuelStation!: string;

  @IsNumber()
  odometer!: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
