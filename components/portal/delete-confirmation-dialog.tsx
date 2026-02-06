'use client';

import * as React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type DialogVariant = 'danger' | 'warning';

interface ConfirmationDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when user confirms the action */
    onConfirm: () => void | Promise<void>;
    /** Dialog title */
    title?: string;
    /** Dialog description */
    description?: string;
    /** Name of the item being affected */
    itemName?: string;
    /** Label for item type (e.g., "Dự án", "Sản phẩm") */
    itemLabel?: string;
    /** Text for confirm button */
    confirmText?: string;
    /** Text for cancel button */
    cancelText?: string;
    /** Visual variant of the dialog */
    variant?: DialogVariant;
    /** Whether the action is in progress */
    loading?: boolean;
    /** Custom icon to display */
    icon?: LucideIcon;
}

const variantConfig: Record<
    DialogVariant,
    {
        iconBg: string;
        iconColor: string;
        buttonClass: string;
    }
> = {
    danger: {
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        buttonClass: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600',
    },
    warning: {
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600',
    },
};

/**
 * Reusable confirmation dialog for destructive actions.
 * Simple and clean design.
 */
export function ConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Xác nhận xóa',
    description,
    itemName,
    itemLabel = 'mục',
    confirmText = 'Xóa',
    cancelText = 'Hủy',
    variant = 'danger',
    loading = false,
    icon: CustomIcon,
}: ConfirmationDialogProps) {
    const config = variantConfig[variant];
    const Icon = CustomIcon || (variant === 'danger' ? Trash2 : AlertTriangle);

    const defaultDescription = itemName
        ? `Bạn có chắc muốn xóa ${itemLabel} "${itemName}"? Hành động này không thể hoàn tác.`
        : `Bạn có chắc muốn xóa ${itemLabel} này? Hành động này không thể hoàn tác.`;

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
            <AlertDialogContent className="max-w-md gap-0 p-0 overflow-hidden">
                {/* Content */}
                <div className="flex gap-4 p-5">
                    {/* Icon */}
                    <div
                        className={cn(
                            'h-10 w-10 shrink-0 rounded-full flex items-center justify-center',
                            config.iconBg,
                        )}
                    >
                        <Icon className={cn('h-5 w-5', config.iconColor)} />
                    </div>

                    <AlertDialogHeader className="space-y-1 text-left">
                        <AlertDialogTitle className="text-base font-semibold">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            {description || defaultDescription}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>

                {/* Buttons */}
                <AlertDialogFooter className="flex-row gap-2 px-5 py-4 border-t bg-muted/30">
                    <AlertDialogCancel disabled={loading} className="h-9 px-4">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn('h-9 px-4 text-white', config.buttonClass)}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Re-export with old name for backwards compatibility
export const DeleteConfirmationDialog = ConfirmationDialog;
