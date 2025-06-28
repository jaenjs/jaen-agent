// src/index.ts
import { app, auth } from "@getcronit/pylon";

// src/controllers/PublishEvent.ts
import { requireAuth } from "@getcronit/pylon";
import { GraphQLError } from "graphql";

// src/get-metadata.ts
import { ServiceError, getContext, getEnv } from "@getcronit/pylon";
var getMetadata = async (key) => {
  const env = getEnv();
  const baseUrl = env.AUTH_ISSUER;
  const c = getContext();
  let authorization = c.req.header("Authorization");
  if (!authorization) {
    const token = c.req.query("token");
    if (token) {
      authorization = `Bearer ${token}`;
    } else {
      throw new Error("No authorization header found");
    }
  }
  const res = await fetch(`${baseUrl}/auth/v1/users/me/metadata/${key}`, {
    headers: {
      Authorization: authorization
    }
  });
  if (!res.ok) {
    throw new ServiceError(`Could not fetch metadata key ${key}`, {
      code: "METADATA_FETCH_ERROR",
      statusCode: res.status,
      details: {
        status: res.statusText
      }
    });
  }
  const data = await res.json();
  const b64Value = data.metadata.value;
  return Buffer.from(b64Value, "base64").toString();
};

// src/controllers/PublishEvent.ts
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
var PublishEvent = class _PublishEvent {
  /**
   * Publishes a migration to Jaen.
   *
   * @param migrationURL - The URL of the migration to publish.
   * @param config - The publish configuration.
   * @returns A `PublishEvent` instance representing the published migration.
   * @throws A `GraphQLError` if the publish event fails.
   */
  static async publish(migrationURL, config2) {
    console.log("Publishing");
    const JAEN_GITHUB_ACCESS_TOKEN = await getMetadata("JAEN_GITHUB_ACCESS_TOKEN");
    console.log("JAEN_GITHUB", JAEN_GITHUB_ACCESS_TOKEN);
    const { repository, repositoryCwd } = config2;
    console.log(`Publishing ${migrationURL} with the following config:`, config2);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `token ${JAEN_GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.everest-preview+json"
    };
    const requestURL = `https://api.github.com/repos/${repository}/dispatches`;
    try {
      const response = await fetch(requestURL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event_type: "UPDATE_JAEN_RESOURCE",
          client_payload: {
            migrationURL,
            cwd: repositoryCwd || "."
          }
        })
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new GraphQLError("Unauthorized");
        } else {
          throw new GraphQLError("Could not publish event");
        }
      }
    } catch (e) {
      console.error(`Invalid response from ${requestURL}`, e);
      throw new GraphQLError("Could not publish event");
    }
    return new _PublishEvent(repository);
  }
  /**
   * Creates a new `PublishEvent` instance.
   * @param repositoryPath - The path of the Jaen repository where the migration was published.
   */
  constructor(repositoryPath) {
    this.repositoryPath = repositoryPath;
    this.publishedDate = /* @__PURE__ */ new Date();
  }
};
__decorate([
  requireAuth(),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String, Object]),
  __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], PublishEvent, "publish", null);

// src/index.ts
import { handler as __internalPylonHandler } from "@getcronit/pylon";
var graphql = {
  Query: {
    version: () => "1.0.0"
  },
  Mutation: {
    publish: PublishEvent.publish
  }
};
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
    repositoryCwd
  });
  return c.json(result);
});
var src_default = app;
var __internalPylonConfig = void 0;
try {
  __internalPylonConfig = config;
} catch {
}
app.use(__internalPylonHandler({
  typeDefs: '"""\nConfiguration options for publishing a migration to Jaen.\n"""\ninput PublishConfigInput {\n	repository: String!\n	repositoryCwd: String\n}\ntype Query {\nversion: String!\n}\ntype Mutation {\npublish("""\n- The URL of the migration to publish.\n@param migrationURL - The URL of the migration to publish.\n"""\nmigrationURL: String!, """\n- The publish configuration.\n@param config - The publish configuration.\n"""\nconfig: PublishConfigInput!): PublishEvent!\n}\n"""\nRepresents a published Jaen migration.\n"""\ntype PublishEvent {\n"""\nThe date when the migration was published.\n"""\npublishedDate: Date!\n"""\nThe path of the Jaen repository where the migration was published.\n"""\nrepositoryPath: String!\n}\nscalar ID\nscalar Int\nscalar Float\nscalar Number\nscalar Any\nscalar Void\nscalar Object\nscalar File\nscalar Date\nscalar JSON\nscalar String\nscalar Boolean\n',
  graphql,
  resolvers: {},
  config: __internalPylonConfig
}));
export {
  src_default as default,
  graphql
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb250cm9sbGVycy9QdWJsaXNoRXZlbnQudHMiLCAiLi4vc3JjL2dldC1tZXRhZGF0YS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgYXBwLCBhdXRoIH0gZnJvbSBcIkBnZXRjcm9uaXQvcHlsb25cIjtcblxuaW1wb3J0IHsgUHVibGlzaEV2ZW50IH0gZnJvbSBcIi4vY29udHJvbGxlcnMvUHVibGlzaEV2ZW50XCI7XG5cbmV4cG9ydCBjb25zdCBncmFwaHFsID0ge1xuICBRdWVyeToge1xuICAgIHZlcnNpb246ICgpID0+IFwiMS4wLjBcIixcbiAgfSxcbiAgTXV0YXRpb246IHtcbiAgICBwdWJsaXNoOiBQdWJsaXNoRXZlbnQucHVibGlzaCxcbiAgfSxcbn07XG5cbi8vIExvZyBpbmNvbWluZyBoZWFkZXJzXG5hcHAudXNlKFwiKlwiLCBhc3luYyAoYywgbmV4dCkgPT4ge1xuICBjb25zb2xlLmxvZyhjLnJlcS5yYXcuaGVhZGVycyk7XG4gIHJldHVybiBuZXh0KCk7XG59KTtcblxuYXBwLnVzZShcIipcIiwgYXV0aC5pbml0aWFsaXplKCkpO1xuXG5hcHAudXNlKFwiKlwiLCBhc3luYyAoYywgbmV4dCkgPT4ge1xuICBjb25zb2xlLmxvZyhjLmdldChcImF1dGhcIikpO1xuXG4gIHJldHVybiBuZXh0KCk7XG59KTtcblxuYXBwLnBvc3QoXCIvd2ViaG9va3Mvc2hvcGlmeVwiLCBhdXRoLnJlcXVpcmUoKSwgYXN5bmMgKGMpID0+IHtcbiAgY29uc3QgcmVwb3NpdG9yeSA9IGMucmVxLnF1ZXJ5KFwicmVwb3NpdG9yeVwiKTtcbiAgY29uc3QgcmVwb3NpdG9yeUN3ZCA9IGMucmVxLnF1ZXJ5KFwicmVwb3NpdG9yeUN3ZFwiKTtcblxuICBpZiAoIXJlcG9zaXRvcnkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXBvc2l0b3J5IGZvdW5kXCIpO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHVibGlzaEV2ZW50LnB1Ymxpc2goXCJcIiwge1xuICAgIHJlcG9zaXRvcnksXG4gICAgcmVwb3NpdG9yeUN3ZCxcbiAgfSk7XG5cbiAgcmV0dXJuIGMuanNvbihyZXN1bHQpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFwcDtcblxuICAgICAgaW1wb3J0IHtoYW5kbGVyIGFzIF9faW50ZXJuYWxQeWxvbkhhbmRsZXJ9IGZyb20gXCJAZ2V0Y3Jvbml0L3B5bG9uXCJcblxuICAgICAgbGV0IF9faW50ZXJuYWxQeWxvbkNvbmZpZyA9IHVuZGVmaW5lZFxuXG4gICAgICB0cnkge1xuICAgICAgICBfX2ludGVybmFsUHlsb25Db25maWcgPSBjb25maWdcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBjb25maWcgaXMgbm90IGRlY2xhcmVkLCBweWxvbkNvbmZpZyByZW1haW5zIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICBhcHAudXNlKF9faW50ZXJuYWxQeWxvbkhhbmRsZXIoe1xuICAgICAgICB0eXBlRGVmczogXCJcXFwiXFxcIlxcXCJcXG5Db25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHB1Ymxpc2hpbmcgYSBtaWdyYXRpb24gdG8gSmFlbi5cXG5cXFwiXFxcIlxcXCJcXG5pbnB1dCBQdWJsaXNoQ29uZmlnSW5wdXQge1xcblxcdHJlcG9zaXRvcnk6IFN0cmluZyFcXG5cXHRyZXBvc2l0b3J5Q3dkOiBTdHJpbmdcXG59XFxudHlwZSBRdWVyeSB7XFxudmVyc2lvbjogU3RyaW5nIVxcbn1cXG50eXBlIE11dGF0aW9uIHtcXG5wdWJsaXNoKFxcXCJcXFwiXFxcIlxcbi0gVGhlIFVSTCBvZiB0aGUgbWlncmF0aW9uIHRvIHB1Ymxpc2guXFxuQHBhcmFtIG1pZ3JhdGlvblVSTCAtIFRoZSBVUkwgb2YgdGhlIG1pZ3JhdGlvbiB0byBwdWJsaXNoLlxcblxcXCJcXFwiXFxcIlxcbm1pZ3JhdGlvblVSTDogU3RyaW5nISwgXFxcIlxcXCJcXFwiXFxuLSBUaGUgcHVibGlzaCBjb25maWd1cmF0aW9uLlxcbkBwYXJhbSBjb25maWcgLSBUaGUgcHVibGlzaCBjb25maWd1cmF0aW9uLlxcblxcXCJcXFwiXFxcIlxcbmNvbmZpZzogUHVibGlzaENvbmZpZ0lucHV0ISk6IFB1Ymxpc2hFdmVudCFcXG59XFxuXFxcIlxcXCJcXFwiXFxuUmVwcmVzZW50cyBhIHB1Ymxpc2hlZCBKYWVuIG1pZ3JhdGlvbi5cXG5cXFwiXFxcIlxcXCJcXG50eXBlIFB1Ymxpc2hFdmVudCB7XFxuXFxcIlxcXCJcXFwiXFxuVGhlIGRhdGUgd2hlbiB0aGUgbWlncmF0aW9uIHdhcyBwdWJsaXNoZWQuXFxuXFxcIlxcXCJcXFwiXFxucHVibGlzaGVkRGF0ZTogRGF0ZSFcXG5cXFwiXFxcIlxcXCJcXG5UaGUgcGF0aCBvZiB0aGUgSmFlbiByZXBvc2l0b3J5IHdoZXJlIHRoZSBtaWdyYXRpb24gd2FzIHB1Ymxpc2hlZC5cXG5cXFwiXFxcIlxcXCJcXG5yZXBvc2l0b3J5UGF0aDogU3RyaW5nIVxcbn1cXG5zY2FsYXIgSURcXG5zY2FsYXIgSW50XFxuc2NhbGFyIEZsb2F0XFxuc2NhbGFyIE51bWJlclxcbnNjYWxhciBBbnlcXG5zY2FsYXIgVm9pZFxcbnNjYWxhciBPYmplY3RcXG5zY2FsYXIgRmlsZVxcbnNjYWxhciBEYXRlXFxuc2NhbGFyIEpTT05cXG5zY2FsYXIgU3RyaW5nXFxuc2NhbGFyIEJvb2xlYW5cXG5cIixcbiAgICAgICAgZ3JhcGhxbCxcbiAgICAgICAgcmVzb2x2ZXJzOiB7fSxcbiAgICAgICAgY29uZmlnOiBfX2ludGVybmFsUHlsb25Db25maWdcbiAgICAgIH0pKVxuICAgICAgIiwgInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG52YXIgX2E7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gXCJAZ2V0Y3Jvbml0L3B5bG9uXCI7XG5pbXBvcnQgeyBHcmFwaFFMRXJyb3IgfSBmcm9tIFwiZ3JhcGhxbFwiO1xuaW1wb3J0IHsgZ2V0TWV0YWRhdGEgfSBmcm9tIFwiLi4vZ2V0LW1ldGFkYXRhXCI7XG4vKipcbiAqIFJlcHJlc2VudHMgYSBwdWJsaXNoZWQgSmFlbiBtaWdyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWJsaXNoRXZlbnQge1xuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyBhIG1pZ3JhdGlvbiB0byBKYWVuLlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pZ3JhdGlvblVSTCAtIFRoZSBVUkwgb2YgdGhlIG1pZ3JhdGlvbiB0byBwdWJsaXNoLlxuICAgICAqIEBwYXJhbSBjb25maWcgLSBUaGUgcHVibGlzaCBjb25maWd1cmF0aW9uLlxuICAgICAqIEByZXR1cm5zIEEgYFB1Ymxpc2hFdmVudGAgaW5zdGFuY2UgcmVwcmVzZW50aW5nIHRoZSBwdWJsaXNoZWQgbWlncmF0aW9uLlxuICAgICAqIEB0aHJvd3MgQSBgR3JhcGhRTEVycm9yYCBpZiB0aGUgcHVibGlzaCBldmVudCBmYWlscy5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgcHVibGlzaChtaWdyYXRpb25VUkwsIGNvbmZpZykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmdcIik7XG4gICAgICAgIGNvbnN0IEpBRU5fR0lUSFVCX0FDQ0VTU19UT0tFTiA9IGF3YWl0IGdldE1ldGFkYXRhKFwiSkFFTl9HSVRIVUJfQUNDRVNTX1RPS0VOXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkpBRU5fR0lUSFVCXCIsIEpBRU5fR0lUSFVCX0FDQ0VTU19UT0tFTik7XG4gICAgICAgIGNvbnN0IHsgcmVwb3NpdG9yeSwgcmVwb3NpdG9yeUN3ZCB9ID0gY29uZmlnO1xuICAgICAgICBjb25zb2xlLmxvZyhgUHVibGlzaGluZyAke21pZ3JhdGlvblVSTH0gd2l0aCB0aGUgZm9sbG93aW5nIGNvbmZpZzpgLCBjb25maWcpO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGB0b2tlbiAke0pBRU5fR0lUSFVCX0FDQ0VTU19UT0tFTn1gLFxuICAgICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL3ZuZC5naXRodWIuZXZlcmVzdC1wcmV2aWV3K2pzb25cIixcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVxdWVzdFVSTCA9IGBodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLyR7cmVwb3NpdG9yeX0vZGlzcGF0Y2hlc2A7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJlcXVlc3RVUkwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudF90eXBlOiBcIlVQREFURV9KQUVOX1JFU09VUkNFXCIsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9wYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaWdyYXRpb25VUkwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjd2Q6IHJlcG9zaXRvcnlDd2QgfHwgXCIuXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgY29tbW9uIGVycm9yc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgR3JhcGhRTEVycm9yKFwiVW5hdXRob3JpemVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcihcIkNvdWxkIG5vdCBwdWJsaXNoIGV2ZW50XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCByZXNwb25zZSBmcm9tICR7cmVxdWVzdFVSTH1gLCBlKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBHcmFwaFFMRXJyb3IoXCJDb3VsZCBub3QgcHVibGlzaCBldmVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFB1Ymxpc2hFdmVudChyZXBvc2l0b3J5KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBgUHVibGlzaEV2ZW50YCBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0gcmVwb3NpdG9yeVBhdGggLSBUaGUgcGF0aCBvZiB0aGUgSmFlbiByZXBvc2l0b3J5IHdoZXJlIHRoZSBtaWdyYXRpb24gd2FzIHB1Ymxpc2hlZC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihyZXBvc2l0b3J5UGF0aCkge1xuICAgICAgICB0aGlzLnJlcG9zaXRvcnlQYXRoID0gcmVwb3NpdG9yeVBhdGg7XG4gICAgICAgIHRoaXMucHVibGlzaGVkRGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgfVxufVxuX19kZWNvcmF0ZShbXG4gICAgcmVxdWlyZUF1dGgoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgRnVuY3Rpb24pLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbU3RyaW5nLCBPYmplY3RdKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnJldHVybnR5cGVcIiwgdHlwZW9mIChfYSA9IHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIFByb21pc2UpID09PSBcImZ1bmN0aW9uXCIgPyBfYSA6IE9iamVjdClcbl0sIFB1Ymxpc2hFdmVudCwgXCJwdWJsaXNoXCIsIG51bGwpO1xuIiwgImltcG9ydCB7IFNlcnZpY2VFcnJvciwgZ2V0Q29udGV4dCwgZ2V0RW52IH0gZnJvbSBcIkBnZXRjcm9uaXQvcHlsb25cIjtcblxuZXhwb3J0IGNvbnN0IGdldE1ldGFkYXRhID0gYXN5bmMgKGtleTogXCJKQUVOX0dJVEhVQl9BQ0NFU1NfVE9LRU5cIikgPT4ge1xuICBjb25zdCBlbnY6IGFueSA9IGdldEVudigpO1xuICBjb25zdCBiYXNlVXJsID0gZW52LkFVVEhfSVNTVUVSO1xuXG4gIGNvbnN0IGMgPSBnZXRDb250ZXh0KCk7XG5cbiAgbGV0IGF1dGhvcml6YXRpb24gPSBjLnJlcS5oZWFkZXIoXCJBdXRob3JpemF0aW9uXCIpO1xuXG4gIGlmICghYXV0aG9yaXphdGlvbikge1xuICAgIC8vIFRyeSB0byBnZXQgdGhlIHRva2VuIGZyb20gdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IHRva2VuID0gYy5yZXEucXVlcnkoXCJ0b2tlblwiKTtcblxuICAgIGlmICh0b2tlbikge1xuICAgICAgYXV0aG9yaXphdGlvbiA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdXRob3JpemF0aW9uIGhlYWRlciBmb3VuZFwiKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS9hdXRoL3YxL3VzZXJzL21lL21ldGFkYXRhLyR7a2V5fWAsIHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uLFxuICAgIH0sXG4gIH0pO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgdGhyb3cgbmV3IFNlcnZpY2VFcnJvcihgQ291bGQgbm90IGZldGNoIG1ldGFkYXRhIGtleSAke2tleX1gLCB7XG4gICAgICBjb2RlOiBcIk1FVEFEQVRBX0ZFVENIX0VSUk9SXCIsXG4gICAgICBzdGF0dXNDb2RlOiByZXMuc3RhdHVzLFxuICAgICAgZGV0YWlsczoge1xuICAgICAgICBzdGF0dXM6IHJlcy5zdGF0dXNUZXh0LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKSkgYXMge1xuICAgIG1ldGFkYXRhOiB7XG4gICAgICB2YWx1ZTogc3RyaW5nO1xuICAgICAga2V5OiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcblxuICBjb25zdCBiNjRWYWx1ZSA9IGRhdGEubWV0YWRhdGEudmFsdWU7XG5cbiAgcmV0dXJuIEJ1ZmZlci5mcm9tKGI2NFZhbHVlLCBcImJhc2U2NFwiKS50b1N0cmluZygpO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLEtBQUssWUFBWTs7O0FDVTFCLFNBQVMsbUJBQW1CO0FBQzVCLFNBQVMsb0JBQW9COzs7QUNYN0IsU0FBUyxjQUFjLFlBQVksY0FBYztBQUUxQyxJQUFNLGNBQWMsT0FBTyxRQUFvQztBQUNwRSxRQUFNLE1BQVcsT0FBTztBQUN4QixRQUFNLFVBQVUsSUFBSTtBQUVwQixRQUFNLElBQUksV0FBVztBQUVyQixNQUFJLGdCQUFnQixFQUFFLElBQUksT0FBTyxlQUFlO0FBRWhELE1BQUksQ0FBQyxlQUFlO0FBRWxCLFVBQU0sUUFBUSxFQUFFLElBQUksTUFBTSxPQUFPO0FBRWpDLFFBQUksT0FBTztBQUNULHNCQUFnQixVQUFVLEtBQUs7QUFBQSxJQUNqQyxPQUFPO0FBQ0wsWUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBRUEsUUFBTSxNQUFNLE1BQU0sTUFBTSxHQUFHLE9BQU8sOEJBQThCLEdBQUcsSUFBSTtBQUFBLElBQ3JFLFNBQVM7QUFBQSxNQUNQLGVBQWU7QUFBQSxJQUNqQjtBQUFBLEVBQ0YsQ0FBQztBQUVELE1BQUksQ0FBQyxJQUFJLElBQUk7QUFDWCxVQUFNLElBQUksYUFBYSxnQ0FBZ0MsR0FBRyxJQUFJO0FBQUEsTUFDNUQsTUFBTTtBQUFBLE1BQ04sWUFBWSxJQUFJO0FBQUEsTUFDaEIsU0FBUztBQUFBLFFBQ1AsUUFBUSxJQUFJO0FBQUEsTUFDZDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLE9BQVEsTUFBTSxJQUFJLEtBQUs7QUFPN0IsUUFBTSxXQUFXLEtBQUssU0FBUztBQUUvQixTQUFPLE9BQU8sS0FBSyxVQUFVLFFB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
