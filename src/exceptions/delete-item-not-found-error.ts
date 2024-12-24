export class DeleteItemNotFoundError extends Error {
  constructor(id: string) {
    super('Unable to delete - item not found with id ' + id);
  }
}
