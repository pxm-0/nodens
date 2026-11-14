# nodens (public mirror)

The source of [nodens.dev](https://nodens.dev): a static Astro site served by nginx.

This repository is generated. Every publish replaces it with a fresh single
commit copied from a private repository, so history is not kept and pull
requests are not accepted.

## Run it

```bash
npm ci
npm run dev
```

## Image

`ghcr.io/pxm-0/nodens-public` is built by this repository's own workflow from
exactly the files here, tagged by commit SHA and `latest`.

```bash
docker run --rm -p 8080:80 ghcr.io/pxm-0/nodens-public:latest
```

## License

Code: [MIT](LICENSE). Writing, images and other content: see
[CONTENT_LICENSE.md](CONTENT_LICENSE.md).
