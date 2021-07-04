/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import argon2, { argon2id } from 'argon2';
// import cookie from 'cookie';
import { Router, Request, Response } from 'express';
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
// import { SessionData } from 'express-session';
import { registerFormSchema } from '../../utils/validation';
import User from '../entity/User';
// import auth from '../middleware/auth';

declare module 'express-session' {
  // eslint-disable-next-line no-shadow
  export interface SessionData {
    user?: any;
  }
}

// TODO: populate && unpopulate routes with faker before and after testing, --hardening ideas: rate limiting, pwned passwords check, --investigate http headers
const register = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { email, username, password } = req.body;
  const hashedPassword = await argon2.hash(password, { type: argon2id }); // Review salts and argon2 vs 2i vs 2d

  try {
    // Check to see if user is present
    const uniqueEmailandUsername = async (): Promise<string[]> => {
      const uniquenessErrors: string[] = [];

      const emailUser = await User.findOne({ email });
      const usernameUser = await User.findOne({ username });

      if (emailUser) uniquenessErrors.push('Email is already taken');
      if (usernameUser) uniquenessErrors.push('Username is already taken');

      return uniquenessErrors;
    };

    const unique = await uniqueEmailandUsername();
    if (unique.length !== 0) return res.status(409).json(unique); // Error: the email and/or username is already taken

    // Validate
    // featNote: This presently will return first error that sees, rather than all errors present
    const validate = async (emailVal: string, usernameVal: string, passwordVal: string): Promise<string[]> => {
      const validationErrors: string[] = [];

      await registerFormSchema
        .validate({ email: emailVal, username: usernameVal, password: passwordVal })
        .catch((err) => {
          return validationErrors.push(err.errors[0]);
        });
      return validationErrors;
    };

    const valid = await validate(email, username, password);
    if (valid.length !== 0) return res.status(422).json(valid); // Error: The input you provided was not valid... Suspect, given the fact that this should've been caught by the application front end

    const user = await User.create({ email, username, password: hashedPassword }).save();
    req.session.user = user;

    return res.status(201).json(user); // The new user has been created
  } catch (error) {
    console.log(error); // On a production system, this would be logged and an issue would be created
    return res.status(500).json(error); // All the different ways the server could send an error can stand to be fleshed out
  }
};

// const login = async (req: Request, res: Response) => {
//   const { username, password } = req.body;
//   let errors: any = {};

//   try {
//     if (isEmpty(username)) errors.username = 'Username must not be empty';
//     if (isEmpty(password)) errors.password = 'Password must not be empty';

//     if (Object.keys(errors).length > 0) return res.status(400).json(errors);

//     const user = await User.findOne({ username: username });
//     if (!user) return res.status(404).json({ username: 'User not found' });

//     const passwordMatches = await argon2.verify(user.password, password);
//     if (!passwordMatches) return res.status(401).json({ password: 'wrong password' });

//     const token = jwt.sign({ username }, process.env.JWT_SECRET!); //TODO: Follow propper secret storing procedures
//     res.set(
//       'Set-Cookie',
//       cookie.serialize('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', //Change on deployment
//         sameSite: 'strict',
//         maxAge: 3600, //comeback and reason throught this
//         path: '/',
//       })
//     );

//     return res.json(user);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(error); //On deployment, change this
//   }
// };

// const me = (_: Request, res: Response) => {
//   return res.json(res.locals.user);
// };

// const logout = (_: Request, res: Response) => {
//   res.set(
//     'Set-Cookie',
//     cookie.serialize('token', '', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       expires: new Date(0),
//       path: '/',
//     })
//   );

//   return res.status(200).json({ success: true });
// };

const router = Router();
router.post('/register', register);
// router.post('/login', login);
// router.get('/me', auth, me);
// router.get('/logout', auth, logout);

export default router;

// TODO: Decide whether implementing error messages for unique username and email is something that makes sense
// TODO: On deployment, we shouldn't send back different messages for username not found and password matches
// TODO: Put the .env file in the gitignore
// TODO: Read up on best practices regarding JWT_SECRET

// TODO: The Grand Refactoring
