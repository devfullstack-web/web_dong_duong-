const ALLOWED_TAGS = new Set([
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'pre',
    'code',
    'span',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
]);

const VOID_TAGS = new Set(['br', 'img']);
const GLOBAL_ATTRS = new Set(['class', 'colspan', 'rowspan', 'data-align']);
const ATTRS_BY_TAG: Record<string, Set<string>> = {
    a: new Set(['href', 'title', 'target', 'rel']),
    img: new Set(['src', 'alt', 'title', 'width', 'height']),
    th: new Set(['colspan', 'rowspan']),
    td: new Set(['colspan', 'rowspan']),
};

const URL_ATTRS = new Set(['href', 'src']);
const DANGEROUS_BLOCKS =
    /<\s*(script|style|iframe|object|embed|svg|math|meta|link|base|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_SINGLE_TAGS =
    /<\s*\/?\s*(script|style|iframe|object|embed|svg|math|meta|link|base|form|input|button|textarea|select)\b[^>]*>/gi;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isSafeUrl(value: string, attrName: string): boolean {
    const normalized = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, '');
    const lower = normalized.toLowerCase();

    if (!normalized) return false;
    if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('file:')
    ) {
        return false;
    }

    if (attrName === 'src') {
        return (
            normalized.startsWith('/') ||
            lower.startsWith('https://') ||
            lower.startsWith('http://')
        );
    }

    return (
        normalized.startsWith('/') ||
        normalized.startsWith('#') ||
        lower.startsWith('https://') ||
        lower.startsWith('http://') ||
        lower.startsWith('mailto:') ||
        lower.startsWith('tel:')
    );
}

function sanitizeAttributeValue(attrName: string, value: string): string | null {
    if (URL_ATTRS.has(attrName) && !isSafeUrl(value, attrName)) return null;

    if ((attrName === 'width' || attrName === 'height' || attrName === 'colspan' || attrName === 'rowspan') && !/^\d{1,4}$/.test(value)) {
        return null;
    }

    if (attrName === 'target' && !['_blank', '_self', '_parent', '_top'].includes(value)) {
        return null;
    }

    return escapeHtml(value);
}

function sanitizeAttributes(tagName: string, attrs: string): string {
    const allowedForTag = ATTRS_BY_TAG[tagName] || new Set<string>();
    const sanitizedAttrs: string[] = [];
    const attrRegex = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = attrRegex.exec(attrs)) !== null) {
        const attrName = match[1].toLowerCase();
        const rawValue = match[2] ?? match[3] ?? match[4] ?? '';

        if (
            attrName.startsWith('on') ||
            attrName === 'style' ||
            attrName === 'srcdoc' ||
            (attrName.startsWith('data-') && attrName !== 'data-align')
        ) {
            continue;
        }

        if (!allowedForTag.has(attrName) && !GLOBAL_ATTRS.has(attrName)) {
            continue;
        }

        const sanitizedValue = sanitizeAttributeValue(attrName, rawValue);
        if (sanitizedValue === null) continue;

        sanitizedAttrs.push(`${attrName}="${sanitizedValue}"`);
    }

    if (tagName === 'a') {
        const hasTargetBlank = sanitizedAttrs.some((attr) => attr === 'target="_blank"');
        if (hasTargetBlank) {
            sanitizedAttrs.push('rel="noopener noreferrer"');
        }
    }

    return sanitizedAttrs.length > 0 ? ` ${sanitizedAttrs.join(' ')}` : '';
}

export function sanitizeRichText(input: unknown): string {
    if (typeof input !== 'string') return '';

    const withoutDangerousBlocks = input
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(DANGEROUS_BLOCKS, '')
        .replace(DANGEROUS_SINGLE_TAGS, '');

    return withoutDangerousBlocks.replace(
        /<\s*(\/)?\s*([a-zA-Z0-9-]+)([^>]*)>/g,
        (fullTag, closingSlash: string | undefined, rawTagName: string, rawAttrs: string) => {
            const tagName = rawTagName.toLowerCase();
            if (!ALLOWED_TAGS.has(tagName)) return '';

            if (closingSlash) {
                return VOID_TAGS.has(tagName) ? '' : `</${tagName}>`;
            }

            const attrs = sanitizeAttributes(tagName, rawAttrs || '');
            return VOID_TAGS.has(tagName) ? `<${tagName}${attrs}>` : `<${tagName}${attrs}>`;
        },
    );
}

export function sanitizePlainText(input: unknown, maxLength = 5000): string {
    if (typeof input !== 'string') return '';

    return input
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

export function sanitizeLocalizedRichText<T extends Record<string, unknown> | null | undefined>(
    value: T,
): T {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

    return Object.fromEntries(
        Object.entries(value).map(([key, localizedValue]) => [
            key,
            typeof localizedValue === 'string' ? sanitizeRichText(localizedValue) : localizedValue,
        ]),
    ) as T;
}

export function sanitizeStringArray(value: unknown): unknown {
    if (!Array.isArray(value)) return value;
    return value.map((item) => (typeof item === 'string' ? sanitizePlainText(item, 1000) : item));
}
