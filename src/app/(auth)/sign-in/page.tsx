'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { startTransition, useActionState } from 'react';
import { Marker, MarkerContent } from '@/components/ui/marker.tsx';
import Link from 'next/link';
import { getInputProps, useForm } from '@conform-to/react';
import { zodValidator } from '@/components/form/zod-validator.ts';
import { signIn } from '@/features/auth/sign-in/actions/sign-in.ts';
import { SignInForm, signInSchema } from '@/features/auth/sign-in/schemas/sign-in-schema.ts';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';

const SignIn = () => {
  const [lastResult, formAction, isPending] = useActionState(signIn, undefined);
  const [form, fields] = useForm<SignInForm>({
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: zodValidator(signInSchema),
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
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!fields.email.errors}>
                <FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
                <Input
                  {...getInputProps(fields.email, { type: 'email' })}
                  placeholder="m@example.com"
                />
                <FieldError errors={fields.email.errors} />
              </Field>

              <Field data-invalid={!!fields.password.errors}>
                <div className="flex items-center">
                  <FieldLabel htmlFor={fields.password.id}>Password</FieldLabel>
                  <a
                    href="#"
                    className="text-muted-foreground ml-auto inline-block text-xs underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
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
              Sign in
            </Button>
            <Marker variant="separator">
              <MarkerContent>or</MarkerContent>
            </Marker>
            <Link href={'/sign-up'} className="w-full">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SignIn;
