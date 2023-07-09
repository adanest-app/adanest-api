import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TokenType } from './token-type.enum';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ ref: 'User', required: true })
  userId: string;

  @Prop({ enum: TokenType })
  type?: string;

  @Prop({ required: true })
  expireAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.set('autoIndex', false);

TokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
