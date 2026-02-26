import type { Options, Content, Topic } from './types.ts';
import { readdirSync, existsSync, lstatSync, writeFile } from 'node:fs';
import { join } from 'path';
import type { Article, Segment } from './types.js';

const options: Options = {
    outname: join('.vitepress', 'wikiConfig.ts'),
    rootDirectory: 'content',
    /**
     * Toggles sidebar navigation expansion.
     */
    expandedByDefault: true,
    /**
     * Exclude directories from visible navigation.
     * This DOES NOT exclude the content from the site.
     */
    excludedDirectories: ['planning', 'scripts', 'git bundles', 'propertyme', 'attachments'],
    excludedFiles: ['02 Shopping List'],
};

main(options);

// given a directory
// walk it and generate a JSON object with text + link per directory
function main(options: Options) {
    assertRootDirectoryExists(options);

    // the wiki contains segments which contain topics (great grandparent, grandparent, parent)
    // topics contain articles (child)
    const segments: Segment[] = [];

    const segmentRawContent = readdirSync(options.rootDirectory)
        // exclude unwanted content early
        .filter(fn => !options.excludedDirectories.includes(fn))
        // all the content we want is a least one directory deep
        .filter(fn => !isFile(join(options.rootDirectory, fn)));

    segmentRawContent.forEach(segment => {
        console.log('📚️ parsing segment:', segment);
        const contents = readdirSync(join(options.rootDirectory, segment));
        const segmentRawContent = applyContentFilters(
            contents.filter(fn => isFile(join(options.rootDirectory, segment, fn))),
            options,
        );

        // any directories within a segment are considered possible topics
        const segmentTopics = contents.filter(fn => !isFile(join(options.rootDirectory, segment, fn)));

        // build segment content
        let segmentContent: Content[] = [];
        if (segmentRawContent.length > 0) {
            const _articles = segmentRawContent.map((title: string) => createArticle(segment, title));
            segmentContent = [..._articles];
        }

        // build segment's topics
        if (segmentTopics.length > 0) {
            const topics = parseTopics(segmentTopics, segment).flat();
            segmentContent = [...segmentContent, ...topics];
        }

        // only create a segment if there is at least one article to avoid zombie segments with no content
        if (segmentContent.length > 0) segments.push(createSegment(segment, segmentContent));
    });

    const configToWrite = JSON.stringify(segments, null, 2);
    const fileContent = `const config = ${configToWrite}\n\nexport default config`;
    writeToFile(fileContent, options);
}

function parseTopics(segmentTopics: string[], segment: string, level = 0): Topic[] {
    console.log('\t📚️ parsing topics for segment:', segment, 'at level', level);
    const topics = segmentTopics.map(topic => {
        const parsedContent: Content[] = [];
        const topicContents = readdirSync(join(options.rootDirectory, segment, topic));

        const topicContent = applyContentFilters(
            topicContents.filter(fn => isFile(join(options.rootDirectory, segment, topic, fn))),
            options,
        );

        parsedContent.push(...topicContent.map((title: string) => createArticle(segment, title, topic)));

        // any directories within a topic are considered additional subtopics which need to be parsed recursively herein
        const subtopics = topicContents
            .filter(fn => !options.excludedDirectories.includes(fn))
            .filter(fn => !isFile(join(options.rootDirectory, segment, topic, fn)));

        if (subtopics.length > 0) {
            console.log('\t📚️📚️ discovered subtopics:', subtopics);
            parsedContent.push(...parseTopics(subtopics, join(segment, topic), level + 1));
        }

        const isTopicCollapsed = level > 0;
        return createTopic(topic, parsedContent, isTopicCollapsed);
    });

    return topics;
}

// #region Factories

function createArticle(segment: string, title: string, topic?: string): Article {
    return {
        text: toTitleCase(title),
        link: topic ? `/${segment}/${topic}/${title}` : `/${segment}/${title}`,
    };
}

function createTopic(title: string, articles: Content[], collapsed: boolean): Topic {
    return {
        text: toTitleCase(title),
        collapsed: collapsed,
        items: articles,
    };
}

function createSegment(title: string, articles: Content[]): Segment {
    return {
        text: toTitleCase(title),
        items: articles,
    };
}

// #endregion

// #region helpers

function assertRootDirectoryExists(options: Options) {
    try {
        if (options.rootDirectory.length === 0) throw new Error(`An empty root directory is not valid`);
        if (!existsSync(options.rootDirectory))
            throw new Error(`Given root directory does not exist: ${options.rootDirectory}`);
    } catch (err) {
        console.error(err);
    }
}

function isFile(fn: string) {
    return lstatSync(fn).isFile();
}

function isMarkdown(fn: string) {
    return fn.match(/\.md$/);
}

function getFileNameWithoutExtension(fn: string) {
    return fn.replace(/\.[^/.]+$/, '');
}

function applyContentFilters(contents: string[], options: Options) {
    return (
        contents
            // only consider markdown files as content
            .filter(fn => isMarkdown(fn))
            // exclude index.md files, vite assumes these exist by convention
            .filter(fn => fn !== 'index.md')
            .map(getFileNameWithoutExtension)
            .filter(fn => !options.excludedFiles.includes(fn))
    );
}

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
}

function writeToFile(content: string, options: Options) {
    console.log('⌛️ writing contents to file:', options.outname);
    writeFile(options.outname, content, { flag: 'w+' }, err => {
        if (err) console.error('❌ Failed to write to', options.outname, err);
        else console.log('✅ content written');
    });
}

// #endregion
