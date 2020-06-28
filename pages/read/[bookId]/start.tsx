import { useRouter } from 'next/router';
// eslint-disable-next-line no-unused-vars
import { Book } from 'epubjs';
import { useEffect, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { getBook } from '../../../services/db';
import loadBook from '../../../services/epub';
import useSpeedReader, { defaultPausing } from '../../../hooks/useSpeedReader';

export default function Read() {
  const router = useRouter();
  const [stateText, setStateText] = useState('loading');
  const [bookText, setBookText] = useState('');
  const { word, pivotElementIndex } = useSpeedReader({
    text: bookText,
    speed: 400,
    pauseConfig: defaultPausing,
  });

  const renderSpeedReader = async (id: string) => {
    const bookFromStorage = await getBook(id);

    if (!bookFromStorage) {
      setStateText('book not found');
      return;
    }

    const book = await loadBook(bookFromStorage.binary);

    const spine = (await book.loaded.spine as any) as Book['spine'];

    spine.each(async (s) => {
      const res = await book.archive.getText(s.canonical);

      const root = document.createElement('root', {});
      root.innerHTML = res;

      setBookText(root.innerText);
    });
  };

  useEffect(() => {
    if (!router.query.bookId) {
      return;
    }

    renderSpeedReader(router.query.bookId as string);
  }, [router.query]);

  return (
    <>
      {word && pivotElementIndex > -1
        ? (
          <Grid container justify="center">
            <Typography style={{
              fontSize: 100,
              position: 'relative',
            }}
            >
              <span style={{ position: 'absolute', top: 0, right: '100%' }}>{word.substr(0, pivotElementIndex)}</span>
              <span>
                <span style={{ color: 'red' }}>{word.substr(pivotElementIndex, 1)}</span>
              </span>
              <span style={{ position: 'absolute', top: 0, left: '100%' }}>{word.substr(pivotElementIndex + 1)}</span>
            </Typography>
          </Grid>
        )
        : stateText}
    </>
  );
}
