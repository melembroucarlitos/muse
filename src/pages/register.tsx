/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FC, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { RegisterFormData, registerFormSchema } from '@src/utils/validation';
// import Head from 'next/head';
// import Link from 'next/link';

const Register: FC = () => {
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerFormSchema),
  });

  return (
    <form
      className="flex flex-col"
      onSubmit={handleSubmit(async (formData: RegisterFormData) => {
        try {
          setSubmiting(true);

          const response = await axios.post('http://localhost:4000/api/auth/register', formData);
          console.log(response);
          router.push('/');
        } catch (err) {
          console.log(err);
          setSubmiting(false);
        }
      })}
    >
      <div className="flex flex-col">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" {...register('username')} />
        {submitAttempted && errors.username && <span>{errors.username.message}</span>}
      </div>
      <div className="flex flex-col mt-2">
        <label htmlFor="email">Email</label>
        <input type="text" id="email" {...register('email')} />
        {submitAttempted && errors.email && <span>{errors.email.message}</span>}
      </div>
      <div className="flex flex-col mt-2">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" {...register('password')} />
        {submitAttempted && errors.password && <span>{errors.password.message}</span>}
      </div>
      <button
        className="self-center px-2 py-1 mt-2 bg-gray-500 rounded-sm "
        type="submit"
        disabled={submiting}
        onClick={() => setSubmitAttempted(true)}
      >
        Register
      </button>
    </form>
  );
};

export default Register;
