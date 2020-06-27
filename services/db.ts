import { v4 as uuid } from 'uuid';

export type DatabaseIndex = {
    books: { [id: string]: BookMeta }
}

export type BookMeta = {
    id: string,
    title: string
}

const keyPrefix = 'speedread_';
const bookPrefix = 'book_';

export const readIndex = (): DatabaseIndex => {
  if (!process.browser) {
    return {
      books: {},
    };
  }
  const index = JSON.parse(window.localStorage.getItem(`${keyPrefix}index`));
  return index;
};
export const writeIndex = (index: DatabaseIndex) => {
  if (!process.browser) {
    return;
  }
  window.localStorage.setItem(`${keyPrefix}index`, JSON.stringify(index));
};
export const read = (id): string | undefined => {
  if (!process.browser) {
    return undefined;
  }
  return window.localStorage.getItem(`${keyPrefix}${bookPrefix}${id}`);
};
export const update = (id: string, binary: string): void => {
  if (!process.browser) {
    return;
  }
  const index = readIndex();
  if (id && index.books[id]) {
    window.localStorage.setItem(`${keyPrefix}${bookPrefix}${id}`, binary);
  }
};
export const write = (binary: string, title: string): void => {
  if (!process.browser) {
    return;
  }
  const id = uuid();
  const index = readIndex();
  window.localStorage.setItem(`${keyPrefix}${bookPrefix}${id}`, binary);
  writeIndex({
    ...index,
    books: {
      ...index?.books,
      [id]: {
        id,
        title,
      },
    },
  });
};
