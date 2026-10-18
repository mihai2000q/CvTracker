'use client';

import React from 'react';
import { format } from 'date-fns';
import { getInputProps } from '@conform-to/react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { FieldGroup } from '@/components/ui/field.tsx';
import FieldControl from '@/components/form/field-control.tsx';
import FormField from '@/components/form/form-field.tsx';
import DateInput from '@/components/form/date-input.tsx';
import TimeInput from '@/components/form/time-input.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import RoundTypeCombobox from '@/features/job-applications/components/interview/round-type-combobox.tsx';
import ContactCombobox from '@/features/organizations/components/contact/contact-combobox.tsx';
import { updateInterviewRound } from '@/features/job-applications/actions/update-interview-round.ts';
import {
  UpdateInterviewRoundForm,
  updateInterviewRoundSchema,
} from '@/features/job-applications/schemas/update-interview-round-schema.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

interface Props {
  round: InterviewRound;
  // Where its contacts are picked from
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// The date and the time are the viewer's wall clock, as when the round was scheduled. Mount it
// again (a new `key`) to start over from a round that changed
const EditInterviewRoundDialog = ({ round, organizationId, open, onOpenChange }: Props) => {
  const scheduledAt = new Date(round.scheduledAt);
  const date = format(scheduledAt, 'yyyy-MM-dd');
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<UpdateInterviewRoundForm>({
      action: updateInterviewRound,
      schema: updateInterviewRoundSchema,
      defaultValue: {
        id: round.id,
        roundType: round.roundType,
        date,
        time: format(scheduledAt, 'HH:mm'),
        contactIds: round.contacts.map((contact) => contact.id),
        notes: round.notes ?? undefined,
      },
      open,
      onOpenChange,
    });

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="px-0 md:max-w-md">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.id, { type: 'hidden' })} />
          <input
            type="hidden"
            name={fields.timeZone.name}
            value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />

          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>Edit Interview Round</DialogTitle>
            <DialogDescription>Change when and with whom this round takes place.</DialogDescription>
          </DialogHeader>

          <Separator />

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh] px-6 py-4'}>
              <FormField field={fields.roundType} label="Round type" required>
                <FieldControl form={form} field={fields.roundType}>
                  {(roundType) => (
                    <RoundTypeCombobox
                      {...roundType}
                      defaultValue={round.roundType}
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
                    {(dateControl) => (
                      <DateInput
                        {...dateControl}
                        defaultValue={date}
                        id={fields.date.id}
                        invalid={!fields.date.valid}
                      />
                    )}
                  </FieldControl>
                </FormField>

                <FormField field={fields.time} label="Time" required>
                  <FieldControl form={form} field={fields.time}>
                    {(timeControl) => (
                      <TimeInput
                        {...timeControl}
                        defaultValue={format(scheduledAt, 'HH:mm')}
                        id={fields.time.id}
                        invalid={!fields.time.valid}
                      />
                    )}
                  </FieldControl>
                </FormField>
              </div>

              <FormField field={fields.contactIds} label="Contacts">
                <FieldControl<string[]> form={form} field={fields.contactIds}>
                  {(contactIds) => (
                    <ContactCombobox
                      organizationId={organizationId}
                      defaultValue={round.contacts}
                      change={contactIds.change}
                      blur={contactIds.blur}
                    />
                  )}
                </FieldControl>
              </FormField>

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
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInterviewRoundDialog;
