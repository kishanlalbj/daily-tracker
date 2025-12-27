export enum GENDER {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  UNKNOWN = "unknown"
}

export interface User {
  id?: string & number;
  first_name: string;
  last_name: string;
  email: string;
  height: number;
  password: string;
  gender: GENDER;
  createdAt?: Date;
}
