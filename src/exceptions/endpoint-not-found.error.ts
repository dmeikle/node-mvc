import { NotFoundSystemError } from './not-found-system.error';

export class EndpointNotFoundError extends NotFoundSystemError {
  constructor() {
    super('Endpoint not found', 404001, '', 'endpoint#not-found');
  }
}
