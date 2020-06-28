// eslint-disable-next-line no-unused-vars
import ePub, { Book } from 'epubjs';
import b64toBlob from 'b64-to-blob';

export const loadBook = async (b64File: string): Promise<Book> => {
  const b64FileCleaned = b64File.replace('data:application/epub+zip;base64,', '');
  const blob = b64toBlob(b64FileCleaned);

  const reader = new FileReader();
  await new Promise((resolve) => {
    reader.addEventListener('load', () => {
      resolve();
    });
    reader.readAsArrayBuffer(blob);
  });

  const book = ePub(reader.result as string, { encoding: 'binary' });

  return book;
};

export default loadBook;
