'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { AuthBrandLogo } from './auth-brand-logo';
import { ForgotPasswordEmailStep } from './forgot-password-email-step';
import { ForgotPasswordOtpStep } from './forgot-password-otp-step';
import { ForgotPasswordResetStep } from './forgot-password-reset-step';
import { FORGOT_PASSWORD_FORM_TEXT } from '../constants/auth-form.constants';

type Step = 'email' | 'otp' | 'password' | 'done';

const STEP_DESCRIPTION: Record<Step, (email: string) => string> = {
  email: () => FORGOT_PASSWORD_FORM_TEXT.emailStepDescription,
  otp: (email) => FORGOT_PASSWORD_FORM_TEXT.otpStepDescription(email),
  password: () => FORGOT_PASSWORD_FORM_TEXT.passwordStepDescription,
  done: () => FORGOT_PASSWORD_FORM_TEXT.successDescription,
};

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  // Held in component state only — a reload sends the user back to the email
  // step rather than leaving a password-reset credential in storage.
  const [resetToken, setResetToken] = useState('');

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <AuthBrandLogo />
        <CardTitle className="text-xl">
          {step === 'done'
            ? FORGOT_PASSWORD_FORM_TEXT.successTitle
            : FORGOT_PASSWORD_FORM_TEXT.title}
        </CardTitle>
        <CardDescription>{STEP_DESCRIPTION[step](email)}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' && (
          <ForgotPasswordEmailStep
            defaultEmail={email}
            onSent={(sentTo) => {
              setEmail(sentTo);
              setStep('otp');
            }}
          />
        )}

        {step === 'otp' && (
          <ForgotPasswordOtpStep
            email={email}
            onVerified={(token) => {
              setResetToken(token);
              setStep('password');
            }}
            onChangeEmail={() => setStep('email')}
          />
        )}

        {step === 'password' && (
          <ForgotPasswordResetStep
            resetToken={resetToken}
            onReset={() => {
              setResetToken('');
              setStep('done');
            }}
          />
        )}

        {step === 'done' && (
          <Button asChild className="w-full">
            <Link href={ROUTES.LOGIN}>{FORGOT_PASSWORD_FORM_TEXT.backToLogin}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
