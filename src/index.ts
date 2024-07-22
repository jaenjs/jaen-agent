import { PylonAPI, ServiceError, auth, defineService } from "@cronitio/pylon";

import { PublishEvent } from "./controllers/PublishEvent";

const service = defineService(
  {
    Mutation: {
      publish: PublishEvent.publish,
    },
  },
  {
    context: (c) => {
      const auth = c.get("auth");

      const baseUrl = process.env.AUTH_ISSUER;

      if (!baseUrl) {
        throw new Error("No AUTH_ISSUER found");
      }

      const getMetadata = async (key: "JAEN_GITHUB_ACCESS_TOKEN") => {
        let authorization = c.req.header("Authorization");

        if (!authorization) {
          // Try to get the token from the query string
          const token = c.req.query("token");

          if (token) {
            authorization = `Bearer ${token}`;
          } else {
            throw new Error("No authorization header found");
          }
        }

        const res = await fetch(`${baseUrl}/auth/v1/users/me/metadata/${key}`, {
          headers: {
            Authorization: authorization,
          },
        });

        if (!res.ok) {
          throw new ServiceError(`Could not fetch metadata key ${key}`, {
            code: "METADATA_FETCH_ERROR",
            statusCode: res.status,
            details: {
              status: res.statusText,
            },
          });
        }

        const data = (await res.json()) as {
          metadata: {
            value: string;
            key: string;
          };
        };

        const b64Value = data.metadata.value;

        return Buffer.from(b64Value, "base64").toString();
      };

      return {
        ...c,
        auth,
        getMetadata,
      };
    },
  }
);

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

export default service;
