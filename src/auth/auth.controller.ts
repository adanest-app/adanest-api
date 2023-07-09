import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from 'src/common/auth-guard.metadata';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any): Promise<any> {
    return {
      access_token: await this.authService.generateToken(
        {
          username: req.user.username,
          sub: req.user._id,
        },
        this.configService.get<string>('token.access'),
      ),
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<string> {
    await this.authService.forgotPassword(email);
    return 'Forgot password email sent';
  }

  @Public()
  @Put('reset-password')
  async resetPassword(
    @Body() { token, password }: ResetPasswordDto,
  ): Promise<string> {
    await this.authService.resetPassword(
      token,
      await this.userService.hashPassword(password),
    );
    return 'Reset password success';
  }
}
