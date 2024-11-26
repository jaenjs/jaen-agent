// src/index.ts
import { app, auth } from "@getcronit/pylon";

// src/controllers/PublishEvent.ts
import { requireAuth } from "@getcronit/pylon";
import { GraphQLError } from "graphql";

// src/get-metadata.ts
import { ServiceError, getContext } from "@getcronit/pylon";
var baseUrl = process.env.AUTH_ISSUER;
if (!baseUrl) {
  throw new Error("No AUTH_ISSUER found in environment variables");
}
var getMetadata = async (key) => {
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
  typeDefs: '"""\nConfiguration options for publishing a migration to Jaen.\n"""\ninput PublishConfigInput {\n	repository: String!\n	repositoryCwd: String\n}\ntype Query {\nversion: String!\n}\ntype Mutation {\n"""\nPublishes a migration to Jaen.\n@param migrationURL - The URL of the migration to publish.\n@param config - The publish configuration.\n@returns A `PublishEvent` instance representing the published migration.\n@throws A `GraphQLError` if the publish event fails.\n"""\npublish("""\n- The URL of the migration to publish.\n@param migrationURL - The URL of the migration to publish.\n"""\nmigrationURL: String!, """\n- The publish configuration.\n@param config - The publish configuration.\n"""\nconfig: PublishConfigInput!): PublishEvent!\n}\n"""\nRepresents a published Jaen migration.\n"""\ntype PublishEvent {\n"""\nEnables basic storage and retrieval of dates and times.\n"""\npublishedDate: Date!\nrepositoryPath: String!\n}\nscalar ID\nscalar Int\nscalar Float\nscalar Number\nscalar Any\nscalar Object\nscalar File\nscalar Date\nscalar JSON\nscalar String\nscalar Boolean\n',
  graphql,
  resolvers: {},
  config: __internalPylonConfig
}));
export {
  src_default as default,
  graphql
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy9jb250cm9sbGVycy9QdWJsaXNoRXZlbnQudHMiLCAiLi4vc3JjL2dldC1tZXRhZGF0YS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgYXBwLCBhdXRoIH0gZnJvbSBcIkBnZXRjcm9uaXQvcHlsb25cIjtcblxuaW1wb3J0IHsgUHVibGlzaEV2ZW50IH0gZnJvbSBcIi4vY29udHJvbGxlcnMvUHVibGlzaEV2ZW50XCI7XG5cbmV4cG9ydCBjb25zdCBncmFwaHFsID0ge1xuICBRdWVyeToge1xuICAgIHZlcnNpb246ICgpID0+IFwiMS4wLjBcIixcbiAgfSxcbiAgTXV0YXRpb246IHtcbiAgICBwdWJsaXNoOiBQdWJsaXNoRXZlbnQucHVibGlzaCxcbiAgfSxcbn07XG5cbi8vIExvZyBpbmNvbWluZyBoZWFkZXJzXG5hcHAudXNlKFwiKlwiLCBhc3luYyAoYywgbmV4dCkgPT4ge1xuICBjb25zb2xlLmxvZyhjLnJlcS5yYXcuaGVhZGVycyk7XG4gIHJldHVybiBuZXh0KCk7XG59KTtcblxuYXBwLnVzZShcIipcIiwgYXV0aC5pbml0aWFsaXplKCkpO1xuXG5hcHAudXNlKFwiKlwiLCBhc3luYyAoYywgbmV4dCkgPT4ge1xuICBjb25zb2xlLmxvZyhjLmdldChcImF1dGhcIikpO1xuXG4gIHJldHVybiBuZXh0KCk7XG59KTtcblxuYXBwLnBvc3QoXCIvd2ViaG9va3Mvc2hvcGlmeVwiLCBhdXRoLnJlcXVpcmUoKSwgYXN5bmMgKGMpID0+IHtcbiAgY29uc3QgcmVwb3NpdG9yeSA9IGMucmVxLnF1ZXJ5KFwicmVwb3NpdG9yeVwiKTtcbiAgY29uc3QgcmVwb3NpdG9yeUN3ZCA9IGMucmVxLnF1ZXJ5KFwicmVwb3NpdG9yeUN3ZFwiKTtcblxuICBpZiAoIXJlcG9zaXRvcnkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXBvc2l0b3J5IGZvdW5kXCIpO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHVibGlzaEV2ZW50LnB1Ymxpc2goXCJcIiwge1xuICAgIHJlcG9zaXRvcnksXG4gICAgcmVwb3NpdG9yeUN3ZCxcbiAgfSk7XG5cbiAgcmV0dXJuIGMuanNvbihyZXN1bHQpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGFwcDtcblxuICAgICAgaW1wb3J0IHtoYW5kbGVyIGFzIF9faW50ZXJuYWxQeWxvbkhhbmRsZXJ9IGZyb20gXCJAZ2V0Y3Jvbml0L3B5bG9uXCJcblxuICAgICAgbGV0IF9faW50ZXJuYWxQeWxvbkNvbmZpZyA9IHVuZGVmaW5lZFxuXG4gICAgICB0cnkge1xuICAgICAgICBfX2ludGVybmFsUHlsb25Db25maWcgPSBjb25maWdcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBjb25maWcgaXMgbm90IGRlY2xhcmVkLCBweWxvbkNvbmZpZyByZW1haW5zIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICBhcHAudXNlKF9faW50ZXJuYWxQeWxvbkhhbmRsZXIoe1xuICAgICAgICB0eXBlRGVmczogXCJcXFwiXFxcIlxcXCJcXG5Db25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHB1Ymxpc2hpbmcgYSBtaWdyYXRpb24gdG8gSmFlbi5cXG5cXFwiXFxcIlxcXCJcXG5pbnB1dCBQdWJsaXNoQ29uZmlnSW5wdXQge1xcblxcdHJlcG9zaXRvcnk6IFN0cmluZyFcXG5cXHRyZXBvc2l0b3J5Q3dkOiBTdHJpbmdcXG59XFxudHlwZSBRdWVyeSB7XFxudmVyc2lvbjogU3RyaW5nIVxcbn1cXG50eXBlIE11dGF0aW9uIHtcXG5cXFwiXFxcIlxcXCJcXG5QdWJsaXNoZXMgYSBtaWdyYXRpb24gdG8gSmFlbi5cXG5AcGFyYW0gbWlncmF0aW9uVVJMIC0gVGhlIFVSTCBvZiB0aGUgbWlncmF0aW9uIHRvIHB1Ymxpc2guXFxuQHBhcmFtIGNvbmZpZyAtIFRoZSBwdWJsaXNoIGNvbmZpZ3VyYXRpb24uXFxuQHJldHVybnMgQSBgUHVibGlzaEV2ZW50YCBpbnN0YW5jZSByZXByZXNlbnRpbmcgdGhlIHB1Ymxpc2hlZCBtaWdyYXRpb24uXFxuQHRocm93cyBBIGBHcmFwaFFMRXJyb3JgIGlmIHRoZSBwdWJsaXNoIGV2ZW50IGZhaWxzLlxcblxcXCJcXFwiXFxcIlxcbnB1Ymxpc2goXFxcIlxcXCJcXFwiXFxuLSBUaGUgVVJMIG9mIHRoZSBtaWdyYXRpb24gdG8gcHVibGlzaC5cXG5AcGFyYW0gbWlncmF0aW9uVVJMIC0gVGhlIFVSTCBvZiB0aGUgbWlncmF0aW9uIHRvIHB1Ymxpc2guXFxuXFxcIlxcXCJcXFwiXFxubWlncmF0aW9uVVJMOiBTdHJpbmchLCBcXFwiXFxcIlxcXCJcXG4tIFRoZSBwdWJsaXNoIGNvbmZpZ3VyYXRpb24uXFxuQHBhcmFtIGNvbmZpZyAtIFRoZSBwdWJsaXNoIGNvbmZpZ3VyYXRpb24uXFxuXFxcIlxcXCJcXFwiXFxuY29uZmlnOiBQdWJsaXNoQ29uZmlnSW5wdXQhKTogUHVibGlzaEV2ZW50IVxcbn1cXG5cXFwiXFxcIlxcXCJcXG5SZXByZXNlbnRzIGEgcHVibGlzaGVkIEphZW4gbWlncmF0aW9uLlxcblxcXCJcXFwiXFxcIlxcbnR5cGUgUHVibGlzaEV2ZW50IHtcXG5cXFwiXFxcIlxcXCJcXG5FbmFibGVzIGJhc2ljIHN0b3JhZ2UgYW5kIHJldHJpZXZhbCBvZiBkYXRlcyBhbmQgdGltZXMuXFxuXFxcIlxcXCJcXFwiXFxucHVibGlzaGVkRGF0ZTogRGF0ZSFcXG5yZXBvc2l0b3J5UGF0aDogU3RyaW5nIVxcbn1cXG5zY2FsYXIgSURcXG5zY2FsYXIgSW50XFxuc2NhbGFyIEZsb2F0XFxuc2NhbGFyIE51bWJlclxcbnNjYWxhciBBbnlcXG5zY2FsYXIgT2JqZWN0XFxuc2NhbGFyIEZpbGVcXG5zY2FsYXIgRGF0ZVxcbnNjYWxhciBKU09OXFxuc2NhbGFyIFN0cmluZ1xcbnNjYWxhciBCb29sZWFuXFxuXCIsXG4gICAgICAgIGdyYXBocWwsXG4gICAgICAgIHJlc29sdmVyczoge30sXG4gICAgICAgIGNvbmZpZzogX19pbnRlcm5hbFB5bG9uQ29uZmlnXG4gICAgICB9KSlcbiAgICAgICIsICJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xudmFyIF9hO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tIFwiQGdldGNyb25pdC9weWxvblwiO1xuaW1wb3J0IHsgR3JhcGhRTEVycm9yIH0gZnJvbSBcImdyYXBocWxcIjtcbmltcG9ydCB7IGdldE1ldGFkYXRhIH0gZnJvbSBcIi4uL2dldC1tZXRhZGF0YVwiO1xuLyoqXG4gKiBSZXByZXNlbnRzIGEgcHVibGlzaGVkIEphZW4gbWlncmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVibGlzaEV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgYSBtaWdyYXRpb24gdG8gSmFlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBtaWdyYXRpb25VUkwgLSBUaGUgVVJMIG9mIHRoZSBtaWdyYXRpb24gdG8gcHVibGlzaC5cbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gVGhlIHB1Ymxpc2ggY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyBBIGBQdWJsaXNoRXZlbnRgIGluc3RhbmNlIHJlcHJlc2VudGluZyB0aGUgcHVibGlzaGVkIG1pZ3JhdGlvbi5cbiAgICAgKiBAdGhyb3dzIEEgYEdyYXBoUUxFcnJvcmAgaWYgdGhlIHB1Ymxpc2ggZXZlbnQgZmFpbHMuXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIHB1Ymxpc2gobWlncmF0aW9uVVJMLCBjb25maWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJQdWJsaXNoaW5nXCIpO1xuICAgICAgICBjb25zdCBKQUVOX0dJVEhVQl9BQ0NFU1NfVE9LRU4gPSBhd2FpdCBnZXRNZXRhZGF0YShcIkpBRU5fR0lUSFVCX0FDQ0VTU19UT0tFTlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJKQUVOX0dJVEhVQlwiLCBKQUVOX0dJVEhVQl9BQ0NFU1NfVE9LRU4pO1xuICAgICAgICBjb25zdCB7IHJlcG9zaXRvcnksIHJlcG9zaXRvcnlDd2QgfSA9IGNvbmZpZztcbiAgICAgICAgY29uc29sZS5sb2coYFB1Ymxpc2hpbmcgJHttaWdyYXRpb25VUkx9IHdpdGggdGhlIGZvbGxvd2luZyBjb25maWc6YCwgY29uZmlnKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgdG9rZW4gJHtKQUVOX0dJVEhVQl9BQ0NFU1NfVE9LRU59YCxcbiAgICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi92bmQuZ2l0aHViLmV2ZXJlc3QtcHJldmlldytqc29uXCIsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcXVlc3RVUkwgPSBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke3JlcG9zaXRvcnl9L2Rpc3BhdGNoZXNgO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXF1ZXN0VVJMLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfdHlwZTogXCJVUERBVEVfSkFFTl9SRVNPVVJDRVwiLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWlncmF0aW9uVVJMLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3dkOiByZXBvc2l0b3J5Q3dkIHx8IFwiLlwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlIGNvbW1vbiBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcihcIlVuYXV0aG9yaXplZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBHcmFwaFFMRXJyb3IoXCJDb3VsZCBub3QgcHVibGlzaCBldmVudFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEludmFsaWQgcmVzcG9uc2UgZnJvbSAke3JlcXVlc3RVUkx9YCwgZSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgR3JhcGhRTEVycm9yKFwiQ291bGQgbm90IHB1Ymxpc2ggZXZlbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQdWJsaXNoRXZlbnQocmVwb3NpdG9yeSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgYFB1Ymxpc2hFdmVudGAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHJlcG9zaXRvcnlQYXRoIC0gVGhlIHBhdGggb2YgdGhlIEphZW4gcmVwb3NpdG9yeSB3aGVyZSB0aGUgbWlncmF0aW9uIHdhcyBwdWJsaXNoZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocmVwb3NpdG9yeVBhdGgpIHtcbiAgICAgICAgdGhpcy5yZXBvc2l0b3J5UGF0aCA9IHJlcG9zaXRvcnlQYXRoO1xuICAgICAgICB0aGlzLnB1Ymxpc2hlZERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIHJlcXVpcmVBdXRoKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEZ1bmN0aW9uKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW1N0cmluZywgT2JqZWN0XSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpyZXR1cm50eXBlXCIsIHR5cGVvZiAoX2EgPSB0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBQcm9taXNlKSA9PT0gXCJmdW5jdGlvblwiID8gX2EgOiBPYmplY3QpXG5dLCBQdWJsaXNoRXZlbnQsIFwicHVibGlzaFwiLCBudWxsKTtcbiIsICJpbXBvcnQgeyBTZXJ2aWNlRXJyb3IsIGdldENvbnRleHQgfSBmcm9tIFwiQGdldGNyb25pdC9weWxvblwiO1xuXG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuQVVUSF9JU1NVRVI7XG5cbmlmICghYmFzZVVybCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJObyBBVVRIX0lTU1VFUiBmb3VuZCBpbiBlbnZpcm9ubWVudCB2YXJpYWJsZXNcIik7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRNZXRhZGF0YSA9IGFzeW5jIChrZXk6IFwiSkFFTl9HSVRIVUJfQUNDRVNTX1RPS0VOXCIpID0+IHtcbiAgY29uc3QgYyA9IGdldENvbnRleHQoKTtcblxuICBsZXQgYXV0aG9yaXphdGlvbiA9IGMucmVxLmhlYWRlcihcIkF1dGhvcml6YXRpb25cIik7XG5cbiAgaWYgKCFhdXRob3JpemF0aW9uKSB7XG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgdG9rZW4gZnJvbSB0aGUgcXVlcnkgc3RyaW5nXG4gICAgY29uc3QgdG9rZW4gPSBjLnJlcS5xdWVyeShcInRva2VuXCIpO1xuXG4gICAgaWYgKHRva2VuKSB7XG4gICAgICBhdXRob3JpemF0aW9uID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGF1dGhvcml6YXRpb24gaGVhZGVyIGZvdW5kXCIpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmx9L2F1dGgvdjEvdXNlcnMvbWUvbWV0YWRhdGEvJHtrZXl9YCwge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24sXG4gICAgfSxcbiAgfSk7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICB0aHJvdyBuZXcgU2VydmljZUVycm9yKGBDb3VsZCBub3QgZmV0Y2ggbWV0YWRhdGEga2V5ICR7a2V5fWAsIHtcbiAgICAgIGNvZGU6IFwiTUVUQURBVEFfRkVUQ0hfRVJST1JcIixcbiAgICAgIHN0YXR1c0NvZGU6IHJlcy5zdGF0dXMsXG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHN0YXR1czogcmVzLnN0YXR1c1RleHQsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpKSBhcyB7XG4gICAgbWV0YWRhdGE6IHtcbiAgICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgICBrZXk6IHN0cmluZztcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IGI2NFZhbHVlID0gZGF0YS5tZXRhZGF0YS52YWx1ZTtcblxuICByZXR1cm4gQnVmZmVyLmZyb20oYjY0VmFsdWUsIFwiYmFzZTY0XCIpLnRvU3RyaW5nKCk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsS0FBSyxZQUFZOzs7QUNVMUIsU0FBUyxtQkFBbUI7QUFDNUIsU0FBUyxvQkFBb0I7OztBQ1g3QixTQUFTLGNBQWMsa0JBQWtCO0FBRXpDLElBQU0sVUFBVSxRQUFRLElBQUk7QUFFNUIsSUFBSSxDQUFDLFNBQVM7QUFDWixRQUFNLElBQUksTUFBTSwrQ0FBK0M7QUFDakU7QUFFTyxJQUFNLGNBQWMsT0FBTyxRQUFvQztBQUNwRSxRQUFNLElBQUksV0FBVztBQUVyQixNQUFJLGdCQUFnQixFQUFFLElBQUksT0FBTyxlQUFlO0FBRWhELE1BQUksQ0FBQyxlQUFlO0FBRWxCLFVBQU0sUUFBUSxFQUFFLElBQUksTUFBTSxPQUFPO0FBRWpDLFFBQUksT0FBTztBQUNULHNCQUFnQixVQUFVLEtBQUs7QUFBQSxJQUNqQyxPQUFPO0FBQ0wsWUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBRUEsUUFBTSxNQUFNLE1BQU0sTUFBTSxHQUFHLE9BQU8sOEJBQThCLEdBQUcsSUFBSTtBQUFBLElBQ3JFLFNBQVM7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
