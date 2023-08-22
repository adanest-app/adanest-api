import { Test, TestingModule } from '@nestjs/testing';
import { NlpController } from './nlp.controller';
import { NlpService } from './nlp.service';

describe('NlpController', () => {
  let nlpController: NlpController;
  let nlpService: NlpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NlpController],
      providers: [
        {
          provide: NlpService,
          useValue: {
            process: jest.fn(),
          },
        },
      ],
    }).compile();

    nlpController = module.get<NlpController>(NlpController);
    nlpService = module.get<NlpService>(NlpService);
  });

  it('should be defined', () => {
    expect(nlpController).toBeDefined();
  });

  it('should process', async () => {
    jest.spyOn(nlpService, 'process').mockResolvedValueOnce('text');
    await nlpController.process({ text: 'text' });
    expect(nlpService.process).toHaveBeenCalledWith('text');
  });
});
