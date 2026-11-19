import { marked } from 'marked';

/**
 * Render trusted, repository-owned Markdown (never user input) to HTML.
 * External links open in a new tab.
 */
export function renderMarkdown(source: string): string {
	const html = marked.parse(source, { async: false, gfm: true }) as string;
	return html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}
