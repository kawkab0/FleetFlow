import { Test, TestingModule } from '@nestjs/testing';
import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';

describe('FuelController', () => {
  let controller: FuelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuelController],
      providers: [FuelService],
    }).compile();

    controller = module.get<FuelController>(FuelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
