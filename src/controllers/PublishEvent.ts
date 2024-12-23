import { requireAuth } from "@getcronit/pylon";
import { GraphQLError } from "graphql";
import { getMetadata } from "../get-metadata";

/**
 * Configuration options for publishing a migration to Jaen.
 */
interface PublishConfig {
  /**
   * The GitHub repository where the migration should be published.
   */
  repository: string;
  /**
   * The directory where the Jaen repository is located (default is the current directory).
   */
  repositoryCwd?: string;
}

/**
 * Represents a published Jaen migration.
 */
export class PublishEvent {
  /**
   * Publishes a migration to Jaen.
   *
   * @param migrationURL - The URL of the migration to publish.
   * @param config - The publish configuration.
   * @returns A `PublishEvent` instance representing the published migration.
   * @throws A `GraphQLError` if the publish event fails.
   */
  @requireAuth()
  static async publish(
    migrationURL: string,
    config: PublishConfig
  ): Promise<PublishEvent> {
    console.log("Publishing");

    const JAEN_GITHUB_ACCESS_TOKEN = await getMetadata(
      "JAEN_GITHUB_ACCESS_TOKEN"
    );

    console.log("JAEN_GITHUB", JAEN_GITHUB_ACCESS_TOKEN);

    const { repository, repositoryCwd } = config;

    console.log(
      `Publishing ${migrationURL} with the following config:`,
      config
    );

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `token ${JAEN_GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.everest-preview+json",
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
            cwd: repositoryCwd || ".",
          },
        }),
      });

      if (!response.ok) {
        // handle common errors
        if (response.status === 401) {
          throw new GraphQLError("Unauthorized");
        } else {
          throw new GraphQLError("Could not publish event");
        }
      }
    } catch (e: unknown) {
      console.error(`Invalid response from ${requestURL}`, e);
      throw new GraphQLError("Could not publish event");
    }

    return new PublishEvent(repository);
  }

  /**
   * The date when the migration was published.
   */
  readonly publishedDate: Date;

  /**
   * The path of the Jaen repository where the migration was published.
   */
  readonly repositoryPath: string;

  /**
   * Creates a new `PublishEvent` instance.
   * @param repositoryPath - The path of the Jaen repository where the migration was published.
   */
  constructor(repositoryPath: string) {
    this.repositoryPath = repositoryPath;
    this.publishedDate = new Date();
  }
}
