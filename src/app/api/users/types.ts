// types.ts
export interface User {
    id: bigint;
    email: string;
    name?: string | null;
    role: 'user' | 'admin';
  }