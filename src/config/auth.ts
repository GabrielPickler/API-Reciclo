export default {
  jwt: {
    secret: `${process.env.TOKEN_SECRET_KEY}`,
    expiresIn: '1d',
  },
};
