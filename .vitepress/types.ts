export interface Options {
    /**
     * The output file of this script. Will be overwritten if it already exists.
     */
    outname: string;
    /**
     * The root of wiki content from a navigation perspective (other files can still be included)
     */
    rootDirectory: string;
    /**
     * Toggles sidebar navigation expansion.
     */
    expandedByDefault: boolean;
    /**
     * Exclude directories from visible navigation.
     * This DOES NOT exclude the content from the site.
     */
    excludedDirectories: string[];
    /**
     * Exclude specific files from visible navigation.
     * This DOES NOT exclude the content from the site.
     */
    excludedFiles: string[];
}

export interface Article {
    text: string;
    link: string;
}

export interface Segment {
    text: string;
    items: Content[];
}

export interface Topic {
    text: string;
    collapsed: boolean;
    items: Content[];
}

export type Content = Article | Topic;
