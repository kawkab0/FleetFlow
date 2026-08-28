import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrderDetailsService } from './sales-order-details.service';

describe('SalesOrderDetailsService', () => {
  let service: SalesOrderDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesOrderDetailsService],
    }).compile();

    service = module.get<SalesOrderDetailsService>(SalesOrderDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
