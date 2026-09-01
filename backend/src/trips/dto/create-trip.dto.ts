import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  tripCode!: string;

  @IsString()
  @IsNotEmpty()
  origin!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsString()
  @IsNotEmpty()
  vehicleCode!: string;

  @IsString()
  @IsNotEmpty()
  driverCode!: string;

  @IsDateString()
  @IsNotEmpty()
  tripDate!: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsNumber()
  @Min(0)
  fuelUsed!: number;

  @IsNumber()
  @Min(0)
  revenue!: number;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
