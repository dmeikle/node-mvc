export class HttpResponse {
  data: any;
  details: object;
  id: string;
  _httpStatus: number;

  /**
   *
   * @param data
   * @param resource
   * @param id
   * @param details
   */
  constructor(data: any, resource: string, id?: string, details?: object) {
    this.data = data;
    this.id = id ?? 'NA';
    this.details = details ?? {
      resource: resource,
      id: id,
    };
  }

  get httpStatus(): number {
    return this._httpStatus;
  }
}
