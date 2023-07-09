import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { TokenType } from './token/token-type.enum';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Token } from './token/token.schema';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { Model } from 'mongoose';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private userService: UsersService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user =
      (await this.userService.getUserByUsername(identifier)) ||
      (await this.userService.getUserByEmail(identifier));

    if (!user) return null;
    const userPassword = await this.userService.getUserPassword(
      user._id.toString(),
    );
    if (await compare(password, userPassword.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return user;
    }

    return null;
  }

  async generateToken(payload: any, expiresIn?: string): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn,
    });
    this.tokenModel.create({
      token,
      userId: payload.sub,
      type: payload?.type,
      expireAt: new Date(ms(expiresIn as StringValue) + Date.now()),
    });
    return token;
  }

  async verifyToken(token: string, type: string): Promise<any> {
    if (!(await this.tokenModel.exists({ token, type }).exec())) return null;
    return this.jwtService.verifyAsync(token);
  }

  async forgotPassword(email: string): Promise<any> {
    const { _id, username } =
      (await this.userService.getUserByEmail(email)) || {};
    if (!_id) throw new BadRequestException('Email not found');
    const token = await this.generateToken(
      {
        username: username,
        sub: _id,
        type: TokenType.RESET_PASSWORD,
      },
      this.configService.get<string>('token.reset_password'),
    );
    await this.mailerService.sendMail({
      to: email,
      from: `"${this.configService.get<string>(
        'smtp.from.name',
      )}" <${this.configService.get<string>('smtp.from.email')}>`,
      subject: '[Adanest] Perbarui Kata Sandi Pengguna',
      text:
        'Halo, ' +
        username +
        '.\n\n' +
        'Silahkan kunjungi link untuk memperbarui kata sandi anda di ' +
        this.configService.get<string>('app.url') +
        'new-password?token=' +
        token +
        '\n\n' +
        'Salam Sehat,\n' +
        'Tim Adanest\n' +
        'Terima kasih.',
    });
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const payload = await this.verifyToken(token, TokenType.RESET_PASSWORD);
    if (!payload) throw new BadRequestException('Invalid Token');
    await this.tokenModel.deleteOne({ token, type: TokenType.RESET_PASSWORD });
    await this.userService.updateUser(payload.sub, {
      password,
    });
    return {
      message: 'Password berhasil diperbarui',
    };
  }
}
