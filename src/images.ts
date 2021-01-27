
//https://stackoverflow.com/a/60595303
function importAll(r:__WebpackModuleApi.RequireContext):string[] {
    return r.keys().map<string>((uri)=>{
        return r(uri).default as string;
    });
  }
  
const images = importAll(require.context('./img/', false, /\.(png|jpe?g|svg)$/));

function imageLoader():string[] {
    return images;
  }
  
  export default imageLoader;