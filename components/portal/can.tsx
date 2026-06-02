'use client';

import { HasPermission } from './has-permission';

/**
 * `<Can>` is an alias component for `<HasPermission>` to provide a shorter,
 * cleaner declarative syntax for permission checks on the frontend.
 *
 * Example:
 * ```tsx
 * <Can permission={PERMISSIONS.BLOG_CREATE}>
 *   <Button>Thêm bài viết</Button>
 * </Can>
 * ```
 */
export const Can = HasPermission;
