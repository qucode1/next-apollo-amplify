import { Amplify, API, withSSRContext } from 'aws-amplify';
import Head from 'next/head';
import { useRouter } from 'next/router';
import awsExports from '../../src/aws-exports';
import { deleteMovie } from '../../src/graphql/mutations';
import { moviesByTitle } from '../../src/graphql/queries';
import { type Movie } from '../../src/API';
import styles from '../../styles/Home.module.css';

Amplify.configure({ ...awsExports, ssr: true });

type MovieProps = {
  movie: Movie
}

export async function getServerSideProps({ req, params }: any) {
  const SSR = withSSRContext({ req });
  const { data } = await SSR.API.graphql({
    query: moviesByTitle,
    variables: {
      title: params.title
    }
  });
  console.log({items: data.moviesByTitle.items});
  return { 
    props: {
      movie: data.moviesByTitle.items?.[0]
    }
  };
}

export default function Movie({ movie }: MovieProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: 'API_KEY',
        query: deleteMovie,
        variables: {
          input: { id: movie.id }
        }
      });

      window.location.href = '/';
    } catch (error: any) {
      const { errors = [] } = error
      if (!error?.errors.length) {
        console.error(error)
      }
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{movie.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{movie.title}</h1>

        <p className={styles.description}>{movie.description}</p>
      </main>

      <footer className={styles.footer}>
        <button onClick={handleDelete}>💥 Delete movie</button>
      </footer>
    </div>
  );
}