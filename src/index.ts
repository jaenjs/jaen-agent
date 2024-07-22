import { PylonAPI, ServiceError, auth, defineService } from "@getcronit/pylon";

import { PublishEvent } from "./controllers/PublishEvent";

export default defineService({
  Mutation: {
    publish: PublishEvent.publish,
  },
});

export const configureApp: PylonAPI["configureApp"] = async (app) => {
  app.use("*", auth.initialize());

  app.post("/webhooks/shopify", auth.require(), async (c) => {
    const repository = c.req.query("repository");
    const repositoryCwd = c.req.query("repositoryCwd");

    if (!repository) {
      throw new Error("No repository found");
    }

    const result = await PublishEvent.publish("", {
      repository,
      repositoryCwd,
    });

    return c.json(result);
  });
};
