#!/bin/sh
IPFS_HASH=$(docker run -d -v $(pwd):/src ipfs/go-ipfs add -Qr /src | tail -n 1)
echo $IPFS_HASH
curl http://cloudflare-ipfs.com/ipfs/$IPFS_HASH
