import { Test, TestingModule } from '@nestjs/testing';
import { NlpService } from './nlp.service';
import { NlpManager } from 'node-nlp';

jest.mock('node-nlp');

describe('NlpService', () => {
  const originalEnv = process.env;
  let nlpService: NlpService;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'dev',
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [NlpService],
    }).compile();

    nlpService = module.get<NlpService>(NlpService);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(nlpService).toBeDefined();
  });

  it('should create nlpManager', () => {
    expect(NlpManager).toHaveBeenCalledWith({ languages: ['id'] });
  });

  it('should constructor train on dev', async () => {
    expect(NlpManager.prototype.train).toHaveBeenCalled();
    expect(NlpManager.prototype.save).toHaveBeenCalled();
  });

  it('should train', async () => {
    jest.spyOn(NlpManager.prototype, 'train').mockResolvedValueOnce();
    jest.spyOn(NlpManager.prototype, 'addCorpus').mockReturnValueOnce();
    jest.spyOn(NlpManager.prototype, 'save').mockReturnValueOnce();
    await nlpService.train('corpus.json', 'model.nlp');
    expect(NlpManager.prototype.train).toHaveBeenCalled();
    expect(NlpManager.prototype.addCorpus).toHaveBeenCalledWith('corpus.json');
    expect(NlpManager.prototype.save).toHaveBeenCalledWith('model.nlp');
  });

  it('should load', async () => {
    jest.spyOn(NlpManager.prototype, 'load').mockResolvedValueOnce();
    await nlpService.load('model.nlp');
    expect(NlpManager.prototype.load).toHaveBeenCalledWith('model.nlp');
  });

  it('should process', async () => {
    jest.spyOn(NlpManager.prototype, 'process');
    await nlpService.process('text');
    expect(NlpManager.prototype.process).toHaveBeenCalledWith('id', 'text');
  });
});
