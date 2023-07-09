export default () => ({
  app: {
    url: process.env.APP_URL,
  },
  port: parseInt(process.env.PORT, 10) || 3000,
  mongo_uri: process.env.MONGO_URI,
  salt_rounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  smtp: {
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: {
      name: process.env.SMTP_FROM_NAME,
      email: process.env.SMTP_FROM_EMAIL,
    },
  },

  token: {
    verify: process.env.VERIFY_TOKEN_EXPIRES_IN,
    reset_password: process.env.RESET_PASSWORD_EXPIRES_IN,
    access: process.env.ACCESS_TOKEN_EXPIRES_IN,
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  },
});
