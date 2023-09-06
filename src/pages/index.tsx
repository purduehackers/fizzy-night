import styles from '@/styles/index.module.css'
import { FC } from 'react';
import { MegaCarousel } from '@/megacarousel/megacarousel';
import Layout, { Content, Footer } from 'antd/es/layout/layout';

const Home: FC = () => {
    return (
        <Layout>
            <Content>
                <MegaCarousel rootClassName={`${styles.megaCarousel}`} />
            </Content>

            {/* <div className={`${styles.footer}`}> */}
            <Footer className={`${styles.footer}`}>
                <img className={`${styles.albumArt}`} src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png" alt="Album Art" />
            </Footer>
            {/* </div> */}
        </Layout>
    )
}

export default Home;