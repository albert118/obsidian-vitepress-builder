# Obsidian Vitepress Builder

[![Latest Deployment](https://github.com/albert118/obsidian-vitepress-builder/actions/workflows/build-and-publish.yml/badge.svg?branch=master&event=push)](https://github.com/albert118/obsidian-vitepress-builder/actions/workflows/build-and-publish.yml)

A toolset to help configure and deploy a static site for Obsidian vaults using Vitepress.

- Editing is done via [Obsidian](https://obsidian.md/).
- The site is built using [VitePress](https://vitepress.dev/)

## Getting Started

```sh
npm run docs:dev
```

## Adding and updating a section

- sections appear in the sidebar/top-left navigation.
- they are configured under `.vitepress/mySectionTitle.mjs`
- sections are imported into the site under `.vitepress/config.mjs`
- a section should typically have an `index.md`
- both the nav and sidebar inclusions of the section should end in a back-slash '/'

## Using [Templater](https://github.com/SilentVoid13/Templater) to Publish Dataview Content

Dataview content is only rendered when viewing in Obsidian natively. However, we can use some scripting and plugin trickery to render the markdown and save it to the file ahead of time. This will let it appear in the resultant Vitepress wiki.

To run this script, head to the target file within Obsidian and run the following using the command pallette,

```sh
Templater: open insert template modal
Publish DataView Queries
```

## Docker Compose Deployments

```sh
npm ci
npm run docs:build
docker compose up
```

Then visit <localhost:8182> to view the deployment.
