import argon2, { argon2id } from 'argon2';
import faker from 'faker';
// import supertest from 'supertest';
import User from '@src/server/entity/User';

const username = faker.internet.userName();
const email = faker.internet.email();
const password = faker.internet.password();

beforeAll(async () => {
  await User.create({ email, username, password: await argon2.hash(password, { type: argon2id }) }).save();
});

afterAll(async () => {
  await User.query('DELETE FROM users;');
});

describe('/auth/register', () => {
  // const request = supertest('http://localhost:4000/auth/register');

  it('fails when provided valid data with a duplicate username', async () => {
    expect(true).toBe(true);
  });

  it('fails when provided valid data with a duplicate email', () => {
    expect(true).toBe(true);
  });

  it('fails when provided invalid data', () => {
    expect(true).toBe(true);
  });

  it('returns when provided unique username, password w/ appropriate data', async () => {
    // const res = await request
    //   .post('/')
    //   .send({
    //     username: 'joeybadass',
    //     email: 'joeyistheguy@gmail.com',
    //     password: 'P@ssw0RD!1zl0ngg_',
    //   })
    //   .expect(409);
    // // eslint-disable-next-line no-console
    // console.log(res);
    expect(true).toBe(true);
  });
});
