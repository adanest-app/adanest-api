import { Injectable } from '@nestjs/common';
import { NlpManager } from 'node-nlp';

@Injectable()
export class NlpService {
  private readonly nlpManager: NlpManager;

  constructor() {
    this.nlpManager = new NlpManager({ languages: ['id'] });
    this.train('corpus.json', 'model.nlp');
    this.load('model.nlp');
  }

  async train(corpus: any, modelFile: string): Promise<void> {
    this.nlpManager.addCorpus(corpus);
    await this.nlpManager.train();
    this.nlpManager.save(modelFile);
  }

  async load(modelFile: string): Promise<void> {
    await this.nlpManager.load(modelFile);
  }

  async process(text: string): Promise<any> {
    return this.nlpManager.process('id', text);
  }
}
