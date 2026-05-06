/**
 * Strip HTML tags from a string and truncate to a max length.
 * Useful for generating meta descriptions from rich text content.
 */
export function stripHtml(html: string, maxLength: number = 160): string {
    const text = html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp;
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')   // Collapse whitespace
        .trim();

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
