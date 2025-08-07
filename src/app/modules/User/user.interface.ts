

export interface TUser {
  firstName?: string;
  lastName?: string;
  userName:string
  email: string;
  password: string;  
};


export interface IIdentification {
  nid: string;
  passport: string;
  tradeLicense: string
}