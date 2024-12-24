/**
 * list
 */
export class ListResultset<T> {
  public list: Array<T>;
  public page: number;
  public pageSize: number;
  public totalCount: number;
  public totalPages: number;

  constructor(
    list: Array<T>,
    page: number,
    pageSize: number,
    totalCount: number,
    totalPages: number,
  ) {
    this.list = list;
    this.page = page;

    // If pageSize is -1, set it to the actual number of rows in the list
    if (pageSize === -1) {
      this.pageSize = list.length;
      this.totalPages = 1; // All results are on one page
    } else {
      this.pageSize = pageSize;
      this.totalPages = totalPages; // Use the calculated totalPages normally
    }

    this.totalCount = totalCount;
  }
}
