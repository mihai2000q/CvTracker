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
import { Label } from '@/components/ui/label';
import React from 'react';
import { Marker, MarkerContent } from '@/components/ui/marker.tsx';
import Link from 'next/link';

const SignIn = () => {
  return (
    <div className={'flex min-h-screen flex-col items-center justify-center'}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-xs text-gray-400 underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" placeholder={'Your password'} required />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
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
    </div>
  );
};

export default SignIn;
