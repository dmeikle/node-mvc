import { Test, TestingModule } from '@nestjs/testing';
import { MvcService } from './mvc.service';

describe('MvcService', () => {
  let service: MvcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MvcService],
    }).compile();

    service = module.get<MvcService>(MvcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
