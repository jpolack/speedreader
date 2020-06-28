import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import { getBook } from '../../../services/db';
import loadBook from '../../../services/epub';

export default function Read() {
  const router = useRouter();
  const [bookInfo, setBookInfo] = useState<{ cover: string, title: string }>(undefined);
  const [stateText, setStateText] = useState('loading');

  const renderPreview = async (id: string) => {
    const bookFromStorage = await getBook(id);

    if (!bookFromStorage) {
      setStateText('book not found');
      return;
    }

    const book = await loadBook(bookFromStorage.binary);

    const cover = await book.loaded.cover;

    const url = await book.archive.createUrl(cover, { base64: false });

    setBookInfo({
      cover: url,
      title: (await book.loaded.metadata).title,
    });
  };

  useEffect(() => {
    if (!router.query.bookId) {
      return;
    }

    renderPreview(router.query.bookId as string);
  }, [router.query]);

  return (
    <>
      {bookInfo
        ? (
          <Grid container justify="center">
            <Grid item xs={12}>
              <Grid container justify="center">
                <Typography variant="h2">{bookInfo.title}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <img src={bookInfo.cover} alt="cover" width="100%" height="100%" />
            </Grid>
            <Grid item xs={12}>
              <Grid container justify="center">
                <Link href={`${router.query.bookId}/start`}>
                  <Button>Start</Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        )
        : stateText}
    </>
  );
}
