// custom ambient declarations
// allow importing css files from packages without type errors

/* make TS happy when you import any CSS from swiper */
declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';
declare module 'swiper/css/scrollbar';
declare module '*.css';  

// you can also add more specific declarations if you prefer
// declare module 'slick-carousel/slick/slick.css';
// declare module 'slick-carousel/slick/slick-theme.css';
