import ePub, { Book } from 'epubjs';
import { useState } from 'react';
import { Grid, Typography, Button } from '@material-ui/core';
import Link from 'next/link';
import b64toBlob from 'b64-to-blob';
import {
  write, readIndex, read,
} from '../services/db';

export default function Home() {
  const [imageUrl, setImageUrl] = useState(undefined);

  const renderPreview = async (book: Book) => {
    const cover = await book.loaded.cover;

    const url = await book.archive.createUrl(cover, { base64: false });

    setImageUrl(url);
  };

  const loadBook = async (b64File: string): Promise<Book> => {
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

  const loadFromFS = async (event) => {
    const { files } = event.target;

    if (!files || files.length !== 1) {
      return;
    }

    const file = files.item(0);

    // eslint-disable-next-line no-useless-escape
    if (!file.type.match('.+.epub')) {
      alert('Please upload an epub');
      return;
    }

    const reader = new FileReader();

    await new Promise((resolve) => {
      reader.addEventListener('load', () => {
        resolve();
      });
      reader.readAsDataURL(file);
    });

    const book = await loadBook(reader.result as string);

    write(reader.result as string, (await book.loaded.metadata).title);
    renderPreview(book);
  };

  const loadFileFromStorage = async (id) => {
    const book = await loadBook(read(id));

    renderPreview(book);
  };

  return (
    <>
      {imageUrl
        ? (
          <Grid container justify="center">
            <Grid item xs={3}>
              <img src={imageUrl} alt="cover" width="100%" height="100%" />
              <Link href="/read">
                <Button>Start</Button>
              </Link>
            </Grid>
          </Grid>
        )
        : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h2">Import book</Typography>
                <input
                  type="file"
                  onChange={loadFromFS}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h2">Load book</Typography>
                <ul>
                  {Object.entries(readIndex().books).map(([key, metaData]) => (
                    <li key={key}>
                      <Grid container>
                        <Grid item>
                          <Typography>
                            {metaData.title}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Button onClick={() => loadFileFromStorage(metaData.id)}>Load</Button>
                        </Grid>
                      </Grid>
                    </li>
                  ))}
                </ul>
              </Grid>
            </Grid>
          </>
        )}
    </>
  );
}
