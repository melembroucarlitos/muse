import * as yup from 'yup';

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
};

export const registerFormSchema = yup.object().shape({
  username: yup.string().min(7).required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    .min(12)
    .matches(/[a-z]/, 'password must have at least one lowercase letter')
    .matches(/[A-Z]/, 'password must have at least one uppercase letter')
    .matches(/[0-9]/, 'password must have at least one number')
    .matches(/\W|_/, 'password must have at least one special character') // This matches any non latin characters as well, so you know becareful son
    .required(),
});

export type LoginFormData = {
  username: string;
  password: string;
};

export const loginFormSchema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
});
