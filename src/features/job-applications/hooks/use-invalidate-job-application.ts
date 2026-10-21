'use client';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys.ts';

// What saving a job application can add to the lists the comboboxes fetch: an organization typed
// in rather than picked, and the documents uploaded with it
export function useInvalidateJobApplication() {
  const queryClient = useQueryClient();

  return async (formData: FormData) => {
    const isUploaded = (name: string) => {
      const file = formData.get(name);
      return file instanceof File && file.size > 0;
    };

    if (!formData.get('organizationId')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    }
    if (isUploaded('cvDocumentFile') || isUploaded('coverLetterDocumentFile')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    }
  };
}
