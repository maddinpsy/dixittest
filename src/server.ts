import path from "path";
import serve from "koa-static";
import { Server } from "boardgame.io/server";
import { Dixit } from "./Game";


const PORT = Number(process.env.PORT || 8000);

const server = Server({ games: [Dixit] });

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, './build');
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});