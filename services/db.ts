import { v4 as uuid } from 'uuid';

export type BookMeta = {
  id: string
  title: string
}

export type Book = {
  id: string
  binary: string
}

const dbName = 'speedreader';
const version = 1;

const objectStores = {
  books: 'books',
  bookMetas: 'bookMetas',
};

const open = async (): Promise<IDBDatabase> => {
  const request = window.indexedDB.open(dbName, version);
  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onerror = () => {
      reject();
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      const db = request.result;

      Object.values(objectStores).forEach((val) => {
        db.createObjectStore(val, { keyPath: 'id' });
      });
    };
  });
};

export const listBooks = async (): Promise<BookMeta[]> => {
  const db = await open();

  return new Promise((resolve) => {
    db
      .transaction(objectStores.bookMetas)
      .objectStore(objectStores.bookMetas)
      .getAll()
      .addEventListener('success', (event: any) => {
        resolve(event.target.result as BookMeta[]);
      });
  });
};

export const saveBook = async (book: string, title: string): Promise<BookMeta> => {
  const db = await open();

  const id = uuid();
  const bookMeta = {
    id,
    title,
  };

  await Promise.all([
    new Promise((resolve) => {
      db
        .transaction(objectStores.bookMetas, 'readwrite')
        .objectStore(objectStores.bookMetas)
        .add(bookMeta)
        .addEventListener('success', (event: any) => {
          resolve(event.target.result as string);
        });
    }),
    new Promise((resolve) => {
      db
        .transaction(objectStores.books, 'readwrite')
        .objectStore(objectStores.books)
        .add({
          id,
          binary: book,
        })
        .addEventListener('success', (event: any) => {
          resolve(event.target.result as string);
        });
    }),
  ]);

  return bookMeta;
};

export const getBook = async (id: string): Promise<Book> => {
  const db = await open();

  return new Promise((resolve) => {
    db
      .transaction(objectStores.books)
      .objectStore(objectStores.books)
      .get(id)
      .addEventListener('success', (event: any) => {
        resolve(event.target.result as Book);
      });
  });
};
