/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FC, useContext, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import UserContext from '@src/contexts/UserContext';
import { LoginFormData, loginFormSchema } from '@src/utils/validation';
// import Head from 'next/head';

// TODO: Implement multiple server error handlers
const Login: FC = () => {
  const { setUser } = useContext(UserContext);

  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [loginErrors, setLoginErrors] = useState<any>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginFormSchema),
  });

  const useTempAccount = async () => {
    try {
      setSubmiting(true);

      const response = await axios.post('http://localhost:4000/api/auth/temp-user');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setUser!(response.data);
      router.push('/');
    } catch (err) {
      console.log(err);
      setSubmiting(false);
    }
  };

  return (
    <div>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(async (formData: LoginFormData) => {
          try {
            setSubmiting(true);

            // Test if server returns us an error
            const response = await axios.post('http://localhost:4000/api/auth/login', formData);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setUser!(response.data);
            router.push('/');
          } catch (err) {
            console.log(err);
            setLoginErrors(err.response.data.password);
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
          Login
        </button>
      </form>
      <div>
        <div className="flex">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <span>Don't have an account??</span>
          <span className="ml-2">
            <Link href="./register">Register</Link>
          </span>
        </div>
        <span>or</span>
        <button className="ml-1" type="button" onClick={useTempAccount}>
          Use a temporary account
        </button>
      </div>
      {loginErrors ? <span>{loginErrors}</span> : null}
    </div>
  );
};

export default Login;
