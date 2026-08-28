import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrderDetailsController } from './sales-order-details.controller';

describe('SalesOrderDetailsController', () => {
  let controller: SalesOrderDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesOrderDetailsController],
    }).compile();

    controller = module.get<SalesOrderDetailsController>(SalesOrderDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
