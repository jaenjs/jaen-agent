import { GraphQLError } from "graphql";

interface PublishConfig {
  jaenGitHubRemote: string;
  jaenGitHubCwd?: string;
  jaenGitHubAccessToken: string;
}

export class PublishEvent {
  static async publish(migrationURL: string, config: PublishConfig) {
    const {
      jaenGitHubRemote,
      jaenGitHubCwd = ".",
      jaenGitHubAccessToken,
    } = config;

    console.log(
      `Publishing ${migrationURL}  with the following config:`,
      config
    );

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `token ${jaenGitHubAccessToken}`,
      Accept: "application/vnd.github.everest-preview+json",
    };

    const requestURL = `https://api.github.com/repos/${jaenGitHubRemote}/dispatches`;

    try {
      const data = await fetch(requestURL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event_type: "UPDATE_JAEN_RESOURCE",
          client_payload: {
            migrationURL,
            cwd: jaenGitHubCwd,
          },
        }),
      });

      if (!data.ok) {
        // handle common errors
        if (data.status === 401) {
          throw new GraphQLError("Unauthorized");
        } else {
          throw new GraphQLError("Could not publish event");
        }
      }
    } catch (e) {
      console.error(`Invalid response from ${requestURL}`, e);
      throw new GraphQLError("Could not publish event");
    }

    return new PublishEvent(jaenGitHubRemote, jaenGitHubCwd);
  }

  publishedDate: Date;
  repositoryPath: string;

  constructor(remote: string, cwd: string) {
    this.publishedDate = new Date();
    this.repositoryPath = `${remote}/${cwd}`;
  }
}
