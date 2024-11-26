import { app, auth } from "@getcronit/pylon";

import { PublishEvent } from "./controllers/PublishEvent";

export const graphql = {
  Query: {
    version: () => "1.0.0",
  },
  Mutation: {
    publish: PublishEvent.publish,
  },
};

// Log incoming headers
app.use("*", async (c, next) => {
  console.log(c.req.raw.headers);
  return next();
});

app.use("*", auth.initialize());

app.use("*", async (c, next) => {
  console.log(c.get("auth"));

  return next();
});

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

export default app;
