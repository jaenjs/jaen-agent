import { ServiceError, getContext } from "@getcronit/pylon";

const baseUrl = process.env.AUTH_ISSUER;

if (!baseUrl) {
  throw new Error("No AUTH_ISSUER found in environment variables");
}

export const getMetadata = async (key: "JAEN_GITHUB_ACCESS_TOKEN") => {
  const c = getContext();

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
