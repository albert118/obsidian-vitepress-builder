import frontMatterModule from 'front-matter';
import { readdirSync, mkdirSync, existsSync, lstatSync, writeFile, readFileSync } from 'node:fs';
import type { Url } from 'node:url';
import { join } from 'path';

export interface Options {
    ingestDirectory: string;
    outputDirectory: string;
}

const options: Options = {
    ingestDirectory: join('.vitepress', 'temp', 'input'),
    outputDirectory: join('.vitepress', 'temp', 'output'),
};

interface FrontMatterAttributes {
    // this could be in the format 'string' or '['array', 'of', 'strings']
    title: string;
    coordinates: [number, number];
    address: string;
    url: Url;
    source: Url;
    created: Date;
    tags: string[];
    itinerary: boolean;
}

main(options);

function main(options: Options) {
    assertDirectoryExists(options.ingestDirectory);
    assertDirectoryExists(options.outputDirectory);

    const subdirectories = readdirSync(options.ingestDirectory)
        // all the content we want is a least one directory deep
        .filter(fn => !isFile(join(options.ingestDirectory, fn)))
        .map(fn => join(options.ingestDirectory, fn));

    console.log('🗄️ discovered', subdirectories.length, 'subdirectories');

    subdirectories.forEach(subdirectory => {
        const pathSegments = subdirectory.split('/');
        const subdirectoryName = pathSegments[pathSegments.length - 1];
        // wth if this happens
        if (!subdirectoryName) throw new Error('No subdirectory name could be resolved!');
        console.log('\t📂 parsing subdirectory:', subdirectoryName);

        const files = readdirSync(subdirectory)
            .filter(fn => isFile(join(subdirectory, fn)))
            .filter(fn => isMarkdown(fn))
            .map(fn => join(subdirectory, fn));

        console.log('\t🗒️ discovered', files.length, ' markdown files within', subdirectoryName);

        // create the output subdirectory to match
        const outputSubdirectory = join(options.outputDirectory, subdirectoryName);
        if (!existsSync(outputSubdirectory)) mkdirSync(outputSubdirectory);

        files.forEach(fn => {
            try {
                const contents = readFileSync(fn, 'utf8');
                // @ts-ignore
                const frontmatter = frontMatterModule(contents);
                if (!frontmatter.attributes) return;

                // parse and update the title
                let _title = (frontmatter.attributes as FrontMatterAttributes).title;
                let originalTitle = _title;

                if (!_title) throw new Error('No title was found in the frontmatter');
                const arrayTest = _title.slice(1).slice(0, _title.length - 2);
                const arrayTitle = Array.from(arrayTest.split(','));
                if (arrayTitle.length > 1) {
                    originalTitle = `[${arrayTitle.join(',')}]`;
                    console.log(originalTitle);
                    if (!arrayTitle[0]) throw new Error('No title was found in the frontmatter');
                    // strip additional " chars if they exist
                    _title = toTitleCase(arrayTitle[0].replaceAll('"', '')).replaceAll("'", '').trim();
                } else {
                    _title = toTitleCase(_title).replaceAll('"', '').replaceAll("'", '').trim();
                }

                // output the result
                writeToFile(
                    // also update the content's frontmatter to clean up this attribute
                    // and ensure that the title is correct in the initial link too
                    contents.replace(/title:.*/, `title: ${_title}`).replace(originalTitle, _title),
                    join(options.outputDirectory, subdirectoryName, `${_title}.md`),
                );
            } catch (err) {
                console.error('\n❌ Failed to ingest file: ', fn, err);
                console.log('\n');
            }
        });
    });
}

// #region helpers

function assertDirectoryExists(directory: string) {
    try {
        if (directory.length === 0) throw new Error(`An empty root directory is not valid`);
        if (!existsSync(directory)) throw new Error(`The given directory does not exist: ${directory}`);
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

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
}

function writeToFile(content: string, output: string) {
    console.log('\t\t⌛️ writing contents to file:', output);
    writeFile(output, content, { flag: 'w+' }, err => {
        if (err) console.error('❌ Failed to write to', output, err);
    });
}

// #endregion
