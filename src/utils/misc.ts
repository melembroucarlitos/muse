export const mod = (a: number, n: number): number => ((a % n) + n) % n;

export const randomString = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export type userNull = {
  id: number | null;
  email: string | null;
  username: string | null;
  password: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
