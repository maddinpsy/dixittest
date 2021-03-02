
//https://stackoverflow.com/a/60595303

/*
dose not work in node.js only in webpack
function importAll(r:__WebpackModuleApi.RequireContext):string[] {
    return r.keys().map<string>((uri)=>{
        return r(uri).default as string;
    });
  }
  
const images = importAll(require.context('./img/', false, /\.(png|jpe?g|svg)$/));
*/
const images = [
"DIXIT_10_CARD_10_72dpi.png",          "DIXIT_5_WALLPAPER_SMARTPHONE_1.jpg",
"DIXIT_10_CARD_11_72dpi.png",          "DIXIT_5_WALLPAPER_SMARTPHONE_2.jpg",
"DIXIT_10_CARD_1_72dpi.png",           "DIXIT_5_WALLPAPER_SMARTPHONE_3.jpg",
"DIXIT_10_CARD_2_72dpi.png",           "DIXIT_6_WALLPAPER_SMARTPHONE_1.jpg",
"DIXIT_10_CARD_3_72dpi.png",           "DIXIT_6_WALLPAPER_SMARTPHONE_2.jpg",
"DIXIT_10_CARD_4_72dpi.png",           "DIXIT_7_WALLPAPER_SMARTPHONE_1.jpg",
"DIXIT_10_CARD_5_72dpi.png",           "DIXIT_7_WALLPAPER_SMARTPHONE_2.jpg",
"DIXIT_10_CARD_6_72dpi.png",           "DIXIT_7_WALLPAPER_SMARTPHONE_3.jpg",
"DIXIT_10_CARD_7_72dpi.png",           "DIXIT_8_WALLPAPER_SMARTPHONE_1.jpg",
"DIXIT_10_CARD_8_72dpi.png",           "DIXIT_8_WALLPAPER_SMARTPHONE_2.jpg",
"DIXIT_10_CARD_9_72dpi.png",           "DIXIT_8_WALLPAPER_SMARTPHONE_3.jpg",
"DIXIT_1_WALLPAPER_SMARTPHONE_1.jpg",  "DIXIT_CARD_1_72dpi.png",
"DIXIT_1_WALLPAPER_SMARTPHONE_2.jpg",  "DIXIT_CARD_2_72dpi.png",
"DIXIT_1_WALLPAPER_SMARTPHONE_3.jpg",  "DIXIT_CARD_3_72dpi.png",
"DIXIT_2_WALLPAPER_SMARTPHONE_1.jpg",  "DIXIT_CARD_4_72dpi.png",
"DIXIT_2_WALLPAPER_SMARTPHONE_2.jpg",  "DIXIT_CARD_5_72dpi.png",
"DIXIT_2_WALLPAPER_SMARTPHONE_3.jpg",  "DIXIT_CARD_6_72dpi.png",
"DIXIT_2_WALLPAPER_SMARTPHONE_4.jpg",  "DIXIT_ODYSSEY_CARD_1_72dpi.png",
"DIXIT_3_WALLPAPER_SMARTPHONE_1.jpg",  "DIXIT_ODYSSEY_CARD_2_72dpi.png",
"DIXIT_3_WALLPAPER_SMARTPHONE_2.jpg",  "DIXIT_ODYSSEY_CARD_3_72dpi.png",
"DIXIT_3_WALLPAPER_SMARTPHONE_3.jpg",  "DIXIT_ODYSSEY_CARD_4_72dpi.png",
"DIXIT_4_CARD_1_72dpi.png",            "DIXIT_ODYSSEY_CARD_5_72dpi.png",
"DIXIT_4_CARD_2_72dpi.png",            "DIXIT_ODYSSEY_CARD_6_72dpi.png",
"DIXIT_4_CARD_3_72dpi.png",            "DIXIT_ODYSSEY_WALLPAPER_SMARTPHONE_1.jpg",
"DIXIT_4_CARD_4_72dpi.png",            "DIXIT_ODYSSEY_WALLPAPER_SMARTPHONE_2.jpg",
"DIXIT_4_CARD_5_72dpi.png",            "DIXIT_ODYSSEY_WALLPAPER_SMARTPHONE_3.jpg",
"DIXIT_4_CARD_6_72dpi.png",            "DIXIT_WALLPAPER_NOEL18_1.jpg",
"DIXIT_4_WALLPAPER_SMARTPHONE_1.jpg",  "DIXIT_WALLPAPER_NOEL18_2.jpg",
"DIXIT_4_WALLPAPER_SMARTPHONE_2.jpg",  "DIXIT_WALLPAPER_NOEL18_3.jpg",
"DIXIT_4_WALLPAPER_SMARTPHONE_3.jpg"
];


function imageLoader():string[] {
    return images;
  }
  
  export default imageLoader;