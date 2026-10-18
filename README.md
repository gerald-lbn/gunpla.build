<h1 align="center">gunpla.build</h1>

<p align="center">
  <strong>Track and share your Gunpla builds on the open social web.</strong>
</p>

<p align="center">
  <a href="https://gunpla.build"><strong>gunpla.build</strong></a> &bull;
  <a href="#contributing">Contributing</a>
</p>

---

gunpla.build is a place to log, photograph, and share your plastic model builds. It is built on [ATProto](https://atproto.com), the same open protocol that powers Bluesky, so your build data lives in your own ATProto account, not on a platform you depend on.

Sign in with your Bluesky or ATProto account. Your kits are records in your PDS. If gunpla.build ever goes away, your data does not go with it.

## Lexicon

Lexicons used by gunpla.build live under the `build.gunpla.*` namespace. They are public and canonical; anyone can build clients on top of them.

- [`build.gunpla.kit`](lexicons/build.gunpla.kit.json): a kit build record.
- [`build.gunpla.like`](lexicons/build.gunpla.like.json): a like on a kit.
- [`build.gunpla.comment`](lexicons/build.gunpla.comment.json): a comment on a kit.

## Stack

| Layer | Technology |
|---|---|
| Backend | [AdonisJS 7](https://adonisjs.com) |
| Frontend | [Inertia](https://inertiajs.com) + React |
| Database | MySQL 8 |
| Identity + data | [ATProto](https://atproto.com) / Bluesky OAuth |
| Real-time | Jetstream firehose |
| Hosting | Docker + Cloudflare Tunnel |

## Contributing

Pull requests are welcome. Open an issue first for anything beyond a small fix so we can discuss the direction.

## License

[AGPL-3.0](LICENSE).
