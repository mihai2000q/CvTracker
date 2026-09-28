'use client';

import React, { startTransition, useActionState } from 'react';
import Link from 'next/link';
import { getInputProps, useForm } from '@conform-to/react';
import { zodValidator } from '@/components/form/zod-validator';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { signUp } from '@/features/auth/sign-up/actions/sign-up';
import { SignUpForm, signUpSchema } from '@/features/auth/sign-up/schemas/sign-up-schema';

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
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader>
            <CardTitle>Create a new account</CardTitle>
            <CardDescription>Enter your details below to create an account</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!fields.name.errors}>
                <FieldLabel htmlFor={fields.name.id}>Name</FieldLabel>
                <Input {...getInputProps(fields.name, { type: 'text' })} placeholder="Example" />
                <FieldError errors={fields.name.errors} />
              </Field>

              <Field data-invalid={!!fields.email.errors}>
                <FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
                <Input
                  {...getInputProps(fields.email, { type: 'email' })}
                  placeholder="m@example.com"
                />
                <FieldError errors={fields.email.errors} />
              </Field>

              <Field data-invalid={!!fields.password.errors}>
                <FieldLabel htmlFor={fields.password.id}>Password</FieldLabel>
                <Input
                  {...getInputProps(fields.password, { type: 'password' })}
                  placeholder="Your password"
                />
                <FieldError errors={fields.password.errors} />
              </Field>

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
