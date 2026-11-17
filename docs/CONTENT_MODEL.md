# Content model

## Entries

A single `entries` collection supports all public notes and posts.

Required fields:

- `title`
- `description`
- `section`: engineering, writing, coffee, or audio
- `kind`: note, essay, log, review, fragment, or field-record
- `publishedAt`

Optional behavior:

- `updatedAt`
- `featured`
- `draft`
- `tags`
- `relatedProjects`: project IDs resolved with Astro content references

This unified model permits a global index while each facet retains its own archive.

## Projects

Projects are separate because they require status and operational honesty.

Important fields:

- `status`
- `phase`
- `stageLabel`
- `featureRank`
- `recordState`
- `summary`
- `caveat`
- `stack`
- `links`: typed verified `live`, `portfolio`, or `source` URLs

A project caveat is not a disclaimer buried at the bottom. It is part of the public record. LociGraph can be in Phase IV while still lacking proper authentication and deployment readiness.

The content filename is the canonical project ID. Entry filenames are likewise the
canonical IDs within their section; do not add manual `slug` fields.

A project gets its own record page only when its `recordState` is `published`.
With `recordState: maintenance` no page is built: the project appears as a card on
the work page with its summary, caveat and verified destinations, and links to it
from entries lead to that card.

## Future collections

Add only when content pressure justifies them:

- objects
- field notes
- correspondence
- listening records
- brew recipes
- exhibitions

Do not create a schema merely because a category is imaginable.
