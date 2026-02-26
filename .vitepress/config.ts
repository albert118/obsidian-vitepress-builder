// import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import wikiConfig from './wikiConfig.ts';
import { tasklist } from '@mdit/plugin-tasklist';
import { imgLazyload } from '@mdit/plugin-img-lazyload';
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links';

const wikiSegments = wikiConfig.map((c, idx) => ({
    key: idx,
    title: c.text,
    link: `/${c.text.toLowerCase()}/`,
}));

const sidebar = wikiSegments.reduce(
    (acc, value) => ({
        ...acc,
        [value.link]: wikiConfig[value.key],
    }),
    {},
);

const nav = wikiSegments.map(segment => ({
    text: segment.title,
    link: segment.link,
}));

// https://vitepress.dev/reference/site-config
export default withMermaid({
    title: 'Daedalus Project 🛠️',
    description: 'A private docs repo for daedalus-project.dev 📖',
    lang: 'en-AU',
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    srcDir: 'content',
    vite: {
        optimizeDeps: {
            include: ['mermaid'],
        },
        ssr: {
            optimizeDeps: {
                include: ['mermaid'],
            },
        },
    },
    markdown: {
        image: {
            // image lazy loading is disabled by default
            lazyLoading: true,
        },
        // https://mdit-plugins.github.io/
        config: md => {
            // https://mdit-plugins.github.io/tasklist.html
            md.use(tasklist);
            // https://mdit-plugins.github.io/img-lazyload.html
            md.use(imgLazyload);
            // https://nolebase-integrations.ayaka.io/pages/en/integrations/markdown-it-bi-directional-links/
            md.use(
                BiDirectionalLinks({
                    dir: 'content/',
                    isRelativePath: true,
                }),
            );
        },
    },
    // remove the .html suffix on pages (it annoys me)
    cleanUrls: true,
    // https://vitepress.dev/reference/default-theme-config
    themeConfig: {
        nav: [{ text: 'Home', link: '/' }, ...nav],
        sidebar: sidebar,
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/albert118/daedalus-project-docs',
            },
            {
                // TODO: custom SVG icon,
                icon: 'github',
                ariaLabel: 'Daedalus Project',
                link: 'https://daedalus-project.dev/',
            },
        ],
        search: {
            provider: 'local',
        },
    },
});
