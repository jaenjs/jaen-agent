import { defineService } from "@snek-at/function";

import { PublishEvent } from "./controllers/PublishEvent";

export default defineService(
  {
    Mutation: {
      publish: PublishEvent.publish,
    },
  },
  {
    configureApp(app) {
      return app;
    },
  }
);
