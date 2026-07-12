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

This unified model permits a global index while each facet retains its own archive.

## Projects

Projects are separate because they require status and operational honesty.

Important fields:

- `status`
- `phase`
- `summary`
- `caveat`
- `stack`
- `links`

A project caveat is not a disclaimer buried at the bottom. It is part of the public record. Locigraph can be Phase IV of VI while still lacking proper authentication and deployment readiness.

## Future collections

Add only when content pressure justifies them:

- objects
- field notes
- correspondence
- listening records
- brew recipes
- exhibitions

Do not create a schema merely because a category is imaginable.
