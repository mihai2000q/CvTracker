'use client';

import React, { startTransition, useActionState } from 'react';
import Link from 'next/link';
import { getInputProps, useForm } from '@conform-to/react';
import { zodValidator } from '@/components/form/zod-validator.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Marker, MarkerContent } from '@/components/ui/marker.tsx';
import { FieldError, FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import { signUp } from '@/features/auth/sign-up/actions/sign-up.ts';
import { SignUpForm, signUpSchema } from '@/features/auth/sign-up/schemas/sign-up-schema.ts';

const SignUp = () => {
  const [lastResult, formAction, isPending] = useActionState(signUp, undefined);
  const [form, fields] = useForm<SignUpForm>({
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: zodValidator(signUpSchema),
    onSubmit(event, { formData }) {
      event.preventDefault();
      startTransition(() => formAction(formData));
    },
  });

  return (
    <div className={'flex min-h-screen flex-col items-center justify-center'}>
      <form id={form.id} onSubmit={form.onSubmit} noValidate className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create a new account</CardTitle>
            <CardDescription>Enter your details below to create an account</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <FormField
                field={fields.name}
                label="Name"
                hideIndicator
                data-invalid={!!fields.name.errors}
              >
                <Input {...getInputProps(fields.name, { type: 'text' })} placeholder="Example" />
              </FormField>

              <FormField
                field={fields.email}
                label="Email"
                hideIndicator
                data-invalid={!!fields.email.errors}
              >
                <Input
                  {...getInputProps(fields.email, { type: 'email' })}
                  placeholder="m@example.com"
                />
              </FormField>

              <FormField
                field={fields.password}
                label="Password"
                hideIndicator
                data-invalid={!!fields.password.errors}
              >
                <Input
                  {...getInputProps(fields.password, { type: 'password' })}
                  placeholder="Your password"
                />
              </FormField>

              {form.errors && <FieldError errors={form.errors} />}
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" loading={isPending}>
              Sign up
            </Button>
            <Marker variant="separator">
              <MarkerContent>or</MarkerContent>
            </Marker>
            <Link href={'/sign-in'} className="w-full">
              <Button variant="outline" className="w-full">
                Login with existing account
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SignUp;
