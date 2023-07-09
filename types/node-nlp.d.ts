declare module 'node-nlp' {
  export class NlpManager {
    constructor(options?: any);
    addCorpus(corpus: any): void;
    train(): Promise<void>;
    save(modelFile: string): void;
    load(modelFile: string): Promise<void>;
    process(language: string, text: string): Promise<any>;
  }
}
