"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"

interface CarouselImage {
  src: string
  alt: string
}

interface CarouselProps {
  images: CarouselImage[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = false,
  showNavigation = false,
}) => {
  return (
    <div className="w-full">
      <style>{`
        .hero-swiper { width: 100%; padding-bottom: 0 !important; }
        .hero-swiper .swiper-slide { width: 320px; }
        .hero-swiper .swiper-slide img { display: block; width: 100%; }
        .hero-swiper .swiper-3d .swiper-slide-shadow-left { background-image: none; }
        .hero-swiper .swiper-3d .swiper-slide-shadow-right { background: none; }
      `}</style>
      <Swiper
        className="hero-swiper"
        spaceBetween={24}
        autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
        effect="coverflow"
        grabCursor={false}
        centeredSlides={true}
        loop={true}
        slidesPerView="auto"
        coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
        pagination={showPagination}
        navigation={
          showNavigation
            ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
            : undefined
        }
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {[...images, ...images].map((image, index) => (
          <SwiperSlide key={index}>
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={image.src}
                width={220}
                height={300}
                className="h-[480px] w-full object-cover"
                alt={image.alt}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
