#!/bin/sh
curl -O https://ipfs.io/ipns/dist.ipfs.io/go-ipfs/$IPFS_VERSION/go-ipfs_$IPFS_VERSION_linux-amd64.tar.gz
echo $IPFS_HASH
curl http://cloudflare-ipfs.com/ipfs/$IPFS_HASH
