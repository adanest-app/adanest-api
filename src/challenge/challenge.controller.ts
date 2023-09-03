import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common';
import { ChallengeService } from './challenge.service';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Put('start')
  async start(@Req() req: any, @Body('endedAt') endedAt: number) {
    return this.challengeService.start(req.user.userId, endedAt);
  }

  @Put('stop')
  async stop(@Req() req: any) {
    return this.challengeService.stop(req.user.userId);
  }

  @Get('isstarted')
  async isStarted(@Req() req: any) {
    return this.challengeService.isStarted(req.user.userId);
  }

  @Get()
  async getChallenge(@Req() req: any, @Query('started') started: boolean) {
    return this.challengeService.findByChallenger(req.user.userId, started);
  }
}
