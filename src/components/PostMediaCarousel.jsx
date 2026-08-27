import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const PostMediaCarousel = ({ post }) => {
  // Normalize images array (supports legacy post.image and new post.images)
  let imageList = [];
  if (post.images && post.images.length > 0) {
    imageList = post.images.map(img => (typeof img === 'string' ? img : img.url));
  } else if (post.image) {
    imageList = [post.image];
  }

  if (imageList.length === 0) return null;

  // Single Image View (Centered in middle)
  if (imageList.length === 1) {
    return (
      <div className="rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] bg-slate-950/5 flex items-center justify-center p-2 text-center w-full mx-auto min-h-[280px]">
        <img
          src={imageList[0]}
          alt="Post media"
          className="max-h-[580px] max-w-full w-auto h-auto object-contain mx-auto my-auto block rounded-xl"
        />
      </div>
    );
  }

  // Multi-Image Carousel with Small Arrow Buttons (Swipe disabled)
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] bg-slate-950/5 w-full mx-auto">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        allowTouchMove={false}
        simulateTouch={false}
        className="w-full h-[420px] sm:h-[540px] neo-swiper"
      >
        {imageList.map((imgUrl, index) => (
          <SwiperSlide key={index} className="!flex !items-center !justify-center !h-full !w-full">
            <div className="flex items-center justify-center w-full h-full p-2 mx-auto text-center relative select-none">
              <img
                src={imgUrl}
                alt={`Post media #${index + 1}`}
                className="max-h-full max-w-full w-auto h-auto object-contain mx-auto my-auto block rounded-xl shadow-xs"
              />
              <span className="absolute top-3 right-3 bg-black/75 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full backdrop-blur-xs shadow-md border border-white/20 z-10 select-none">
                {index + 1} / {imageList.length}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
