import { NlpController } from './nlp.controller';
import { NlpService } from './nlp.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [NlpController],
  providers: [NlpService],
})
export class NlpModule {}
