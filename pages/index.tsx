import { useState, useEffect } from 'react';
import { Grid, Typography, Button } from '@material-ui/core';
import { useRouter } from 'next/router';
import {
  listBooks, saveBook,
} from '../services/db';
import { loadBook } from '../services/epub';

export default function Home() {
  const router = useRouter();
  const [bookList, setBookList] = useState(undefined);

  useEffect(() => {
    (async () => {
      setBookList(await listBooks());
    })();
  }, []);

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

    const { id } = await saveBook(reader.result as string, (await book.loaded.metadata).title);

    router.push(`/read/${id}`);
  };

  const loadFileFromStorage = async (id) => {
    router.push(`/read/${id}`);
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h2">Import book</Typography>
          <input
            type="file"
            onChange={loadFromFS}
          />
        </Grid>
        {bookList && bookList.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h2">Load book</Typography>
            <ul>
              {bookList.map((bookMeta) => (
                <li key={bookMeta.id}>
                  <Grid container>
                    <Grid item>
                      <Typography>
                        {bookMeta.title}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Button onClick={() => loadFileFromStorage(bookMeta.id)}>Load</Button>
                    </Grid>
                  </Grid>
                </li>
              ))}
            </ul>
          </Grid>
        )}
      </Grid>
    </>
  );
}
