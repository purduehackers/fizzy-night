import Head from 'next/head'
import Image from 'next/image'
import { Space_Mono } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const space_mono = Space_Mono({ weight: '400', subsets: ['latin'] });

export default function Home() {
    return (
        <>
            <Head>
                <title>Hero Screen</title>
                <meta name="description" content="Purdue Hack Club's Hero Screen" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${space_mono.className}`}>
                <div className={`${styles.dynamicGrid}`}>
                
                </div>
                <div className={`${styles.footer}`}>
                    <img className={`${styles.albumArt}`} src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png" alt="Album Art" />
                </div>
            </main>
        </>
    )
}
