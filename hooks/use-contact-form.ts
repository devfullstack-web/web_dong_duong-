'use client';

import * as React from 'react';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';

export interface ContactFormData {
    name: string;
    phone: string;
    email: string;
    address: string;
    message: string;
}

const EMPTY_CONTACT_FORM: ContactFormData = {
    name: '',
    phone: '',
    email: '',
    address: '',
    message: '',
};

interface UseContactFormOptions {
    requiredFields?: Array<keyof ContactFormData>;
    messages: {
        required: string;
        success: string;
        generalError: string;
    };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    const maybeError = error as { response?: { data?: { message?: string; error?: string } } };

    return maybeError.response?.data?.message || maybeError.response?.data?.error || fallback;
}

export function useContactForm({
    requiredFields = ['name', 'phone', 'email', 'message'],
    messages,
}: UseContactFormOptions) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState<ContactFormData>(EMPTY_CONTACT_FORM);

    const handleChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = event.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        [],
    );

    const handleSubmit = React.useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault();

            const hasMissingField = requiredFields.some((field) => !formData[field]);
            if (hasMissingField) {
                toast.error(messages.required);
                return;
            }

            setIsSubmitting(true);
            try {
                await $api.post(API_ROUTES.CONTACTS, formData);
                toast.success(messages.success);
                setFormData(EMPTY_CONTACT_FORM);
            } catch (error: unknown) {
                toast.error(getApiErrorMessage(error, messages.generalError));
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, messages.generalError, messages.required, messages.success, requiredFields],
    );

    return {
        formData,
        isSubmitting,
        handleChange,
        handleSubmit,
    };
}
