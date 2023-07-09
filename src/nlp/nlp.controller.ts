import { Controller, Post, Body } from '@nestjs/common';
import { NlpService } from './nlp.service';

@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Post('process')
  async process(@Body() body: { text: string }): Promise<any> {
    return this.nlpService.process(body.text);
  }
}
