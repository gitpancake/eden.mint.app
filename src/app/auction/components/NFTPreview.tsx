"use client";

import { useEffect, useState } from "react";
import { useChainId, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { resolveIpfsUriToGateway } from "../../utils/ipfs";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTPreviewProps {
  tokenId: bigint;
  className?: string;
}

export function NFTPreview({ tokenId, className = "" }: NFTPreviewProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const chainId = useChainId();

  // Dynamically read tokenURI from the contract for this tokenId
  const {
    data: tokenUri,
    isLoading: isTokenUriLoading,
    error: tokenUriError,
  } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "tokenURI",
    args: [tokenId],
    chainId: baseSepolia.id,
  });

  // No baseTokenURI in new ABI; server-side fallback will be used instead

  useEffect(() => {
    console.log({ tokenUriError, tokenUri, tokenId, addr: AUCTION_CONTRACT_CONFIG.address, chainId });
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        let effectiveUri: string | undefined = typeof tokenUri === "string" ? tokenUri : undefined;
        if (!effectiveUri) {
          try {
            const res = await fetch(`/api/token-uri/${tokenId.toString()}`, { cache: "no-store" });
            if (res.ok) {
              const json = (await res.json()) as { tokenUri?: string };
              if (json?.tokenUri && typeof json.tokenUri === "string") {
                effectiveUri = json.tokenUri;
              }
            }
          } catch {}
        }
        if (!effectiveUri) throw new Error("Token URI not available for this tokenId");

        // Resolve IPFS URIs to a gateway if needed; http(s) URIs are used as-is
        const resolvedUri = resolveIpfsUriToGateway(effectiveUri);

        const response = await fetch(resolvedUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error("Error fetching NFT metadata:", err);
        setError(err instanceof Error ? err.message : "Failed to load NFT metadata");
      } finally {
        setLoading(false);
      }
    };

    // Fetch when tokenURI becomes available or tokenId changes
    if (tokenUri && typeof tokenUri === "string") {
      fetchMetadata();
    }
  }, [tokenId, tokenUri, tokenUriError, chainId]);

  if (isTokenUriLoading || loading) {
    return (
      <div className={`${className}`}>
        <div className="aspect-square border border-black bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        <div className="mt-4">
          <div className="h-6 border border-emerald-200 bg-emerald-50 animate-pulse mb-2"></div>
          <div className="h-4 border border-emerald-200 bg-emerald-50 animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  if (tokenUriError || error || !metadata || !metadata.image) {
    return (
      <div className={`${className}`}>
        <div className="aspect-square border-2 border-dashed border-black bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">[ ]</div>
            <div className="font-mono text-xs text-black uppercase tracking-wide">{(tokenUriError && String(tokenUriError)) || error || "No metadata available"}</div>
            <div className="font-mono text-xs text-black mt-1">Token #{tokenId.toString()}</div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-mono text-lg font-bold text-black uppercase tracking-widest">Token #{tokenId.toString()}</h3>
          <p className="font-mono text-xs text-black mt-1">Metadata unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* NFT Image */}
      <div className="aspect-square border border-black bg-white overflow-hidden relative group">
        <img
          src={resolveIpfsUriToGateway(metadata.image)}
          alt={metadata.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwMDAwIiBmb250LXNpemU9IjE2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPgo=";
          }}
        />

        {/* Overlay with external link */}
        {metadata.external_url && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={metadata.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors border border-black"
            >
              View Details →
            </a>
          </div>
        )}
      </div>

      {/* NFT Details */}
      <div className="mt-4">
        <h3 className="font-mono text-lg font-bold text-black uppercase tracking-widest">{metadata.name}</h3>
        <p className="font-mono text-xs text-black mt-1 line-clamp-3">{metadata.description}</p>

        {/* Attributes */}
        {metadata.attributes && metadata.attributes.length > 0 && (
          <div className="mt-4">
            <h4 className="font-mono text-xs font-bold text-black mb-2 uppercase tracking-widest">Attributes</h4>
            <div className="grid grid-cols-2 gap-2">
              {(metadata.attributes.length > 4 && showAllAttributes ? metadata.attributes : metadata.attributes.slice(0, 4)).map((attr, index) => (
                <div key={index} className="border border-emerald-200 bg-emerald-50 p-2">
                  <div className="font-mono text-xs text-black uppercase tracking-wide">{attr.trait_type}</div>
                  <div className="font-mono text-xs font-bold text-black">{attr.value}</div>
                </div>
              ))}
            </div>
            {metadata.attributes.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllAttributes((v) => !v)}
                className="font-mono text-xs text-black mt-2 underline underline-offset-2 hover:text-emerald-700"
                aria-expanded={showAllAttributes}
              >
                {showAllAttributes ? `hide ${metadata.attributes.length - 4} attributes` : `+ ${metadata.attributes.length - 4} attributes`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
