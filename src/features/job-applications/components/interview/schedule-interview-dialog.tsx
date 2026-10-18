'use client';

import React from 'react';
import { getInputProps } from '@conform-to/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import DateInput from '@/components/form/date-input.tsx';
import TimeInput from '@/components/form/time-input.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import FieldControl from '@/components/form/field-control.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast.tsx';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { STATUSES_BEFORE_INTERVIEW } from '@/features/job-applications/constants/job-application-statuses.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { scheduleInterview } from '@/features/job-applications/actions/schedule-interview.ts';
import {
  ScheduleInterviewForm,
  scheduleInterviewSchema,
} from '@/features/job-applications/schemas/schedule-interview-schema.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import RoundTypeCombobox from '@/features/job-applications/components/interview/round-type-combobox.tsx';
import ContactCombobox from '@/features/organizations/components/contact/contact-combobox.tsx';
import NewContactSection from '@/features/job-applications/components/interview/new-contact-section.tsx';
import { Separator } from '@/components/ui/separator.tsx';

type JobApplication = {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  organization: { id: string; name: string };
};

interface Props {
  jobApplication: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleInterviewDialog = ({ jobApplication, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<ScheduleInterviewForm>({
      action: scheduleInterview,
      schema: scheduleInterviewSchema,
      open,
      onOpenChange,
      onSuccess: async (formData) => {
        toast.add({
          type: 'success',
          title: STATUSES_BEFORE_INTERVIEW.includes(jobApplication.currentStatus)
            ? 'Interview scheduled! Status moved to Interview'
            : 'Interview scheduled',
          description:
            `${ROUND_TYPE_LABELS[formData.get('roundType') as RoundType]}` +
            `for ${jobApplication.title} at ${jobApplication.organization.name}`,
        });

        if (formData.get('newContact.name')) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
        }
      },
    });

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="px-0 md:max-w-md">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Add an interview round for {jobApplication.title} at{' '}
              <b>{jobApplication.organization.name}</b>.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh] px-6 py-4'}>
              <input type="hidden" name={fields.jobApplicationId.name} value={jobApplication.id} />
              <input
                type="hidden"
                name={fields.timeZone.name}
                value={Intl.DateTimeFormat().resolvedOptions().timeZone}
              />

              <FormField field={fields.roundType} label="Round type" required>
                <FieldControl form={form} field={fields.roundType}>
                  {(roundType) => (
                    <RoundTypeCombobox
                      {...roundType}
                      name={fields.roundType.name}
                      id={fields.roundType.id}
                      invalid={!fields.roundType.valid}
                    />
                  )}
                </FieldControl>
              </FormField>

              <div className={'flex gap-4'}>
                <FormField field={fields.date} label="Date" required>
                  <FieldControl form={form} field={fields.date}>
                    {(date) => (
                      <DateInput
                        {...date}
                        id={fields.date.id}
                        invalid={!fields.date.valid}
                        disable={'past'}
                      />
                    )}
                  </FieldControl>
                </FormField>

                <FormField field={fields.time} label="Time" required>
                  <FieldControl form={form} field={fields.time}>
                    {(time) => (
                      <TimeInput {...time} id={fields.time.id} invalid={!fields.time.valid} />
                    )}
                  </FieldControl>
                </FormField>
              </div>

              <FormField field={fields.contactIds} label="Contacts">
                <FieldControl<string[]> form={form} field={fields.contactIds}>
                  {(contactIds) => (
                    <ContactCombobox
                      organizationId={jobApplication.organization.id}
                      change={contactIds.change}
                      blur={contactIds.blur}
                    />
                  )}
                </FieldControl>
              </FormField>
              <NewContactSection
                contact={fields.newContact}
                onClose={() => form.reset({ name: fields.newContact.name })}
              />

              <FormField field={fields.notes} label="Notes" className={'pb-4'}>
                <Textarea
                  {...getInputProps(fields.notes, { type: 'text' })}
                  placeholder={'Interviewers, link to the call...'}
                  className={'max-h-32'}
                />
              </FormField>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className={'sm:flex-col'}>
            <Separator />
            <div className={'flex gap-2 pt-2'}>
              <DialogClose onClick={reset} render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" loading={isPending}>
                Schedule
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
