import { FC } from "react";

export type MegaCarouselProps = {
    rootClassName: string;
};

export const MegaCarousel: FC<MegaCarouselProps> = ({ rootClassName }) => {
    return <div className={rootClassName}></div>;
};
