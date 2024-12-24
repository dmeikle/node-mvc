export interface AccountMappingsInterceptorRequest extends Request {
  accountMappingsId: string;
  roles: string[];
  ssoId: string;
}
