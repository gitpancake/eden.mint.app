export function resolveIpfsUriToGateway(uri: string | undefined | null): string {
  if (!uri) return "";

  const fallbackGateway = "https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs/";
  // Prefer env var if provided, else use the provided Pinata gateway
  const gateway = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || fallbackGateway).replace(/\/$/, "/");

  // If already an http(s) URL, return as-is
  if (/^https?:\/\//i.test(uri)) return uri;

  // Normalize "ipfs://ipfs/<cid>/path" and "ipfs://<cid>/path"
  if (uri.startsWith("ipfs://")) {
    let path = uri.slice("ipfs://".length);
    if (path.startsWith("ipfs/")) {
      path = path.slice("ipfs/".length);
    }
    return `${gateway}${path}`;
  }

  // Handle "/ipfs/<cid>/path" style paths
  if (uri.startsWith("/ipfs/")) {
    return `${gateway}${uri.slice("/ipfs/".length)}`;
  }

  // As a final fallback, return unchanged
  return uri;
}
