'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { paymentMethodSchema } from '@/lib/validators';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHODS,
  STRIPE_SUPPORTED_CURRENCIES,
  PAYPAL_SUPPORTED_CURRENCIES,
} from '@/lib/constants';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader, CreditCard, Wallet, Banknote, Check, ShieldCheck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';
import { cn } from '@/lib/utils';

const PAYMENT_METHOD_META: Record<string, { icon: React.ElementType; description: string }> = {
  PayPal: { icon: Wallet, description: 'Pay securely with your PayPal balance or linked cards' },
  Stripe: { icon: CreditCard, description: 'Pay with credit or debit card' },
  CashOnDelivery: { icon: Banknote, description: 'Pay with cash when your order arrives' },
};

// Providers not listed here (e.g. CashOnDelivery) have no processor and are
// always available regardless of currency. Neither Stripe nor PayPal
// support every currency in SUPPORTED_CURRENCIES (see lib/constants) — the
// value charged must match what's displayed, so an unsupported provider is
// hidden rather than silently charged in a different currency.
const CURRENCY_SUPPORT: Record<string, readonly string[]> = {
  Stripe: STRIPE_SUPPORTED_CURRENCIES,
  PayPal: PAYPAL_SUPPORTED_CURRENCIES,
};

const isMethodSupported = (method: string, currency: string) =>
  !CURRENCY_SUPPORT[method] || CURRENCY_SUPPORT[method].includes(currency);

const PaymentMethodForm = ({
  preferredPaymentMethod,
  activeCurrency,
}: {
  preferredPaymentMethod: string | null;
  activeCurrency: string;
}) => {
  const router = useRouter();

  const availableMethods = PAYMENT_METHODS.filter((pm) => isMethodSupported(pm, activeCurrency));
  const preferredIsAvailable =
    preferredPaymentMethod && isMethodSupported(preferredPaymentMethod, activeCurrency);
  const defaultMethod = preferredIsAvailable
    ? preferredPaymentMethod!
    : isMethodSupported(DEFAULT_PAYMENT_METHOD, activeCurrency)
      ? DEFAULT_PAYMENT_METHOD
      : availableMethods[0];

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: defaultMethod,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push('/place-order');
    });
  };

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-6 md:p-8'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border shadow-sm'>
            <CreditCard className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold'>Payment Method</h1>
            <p className='text-sm text-muted-foreground'>Choose how you&apos;d like to pay</p>
          </div>
        </div>

        {availableMethods.length < PAYMENT_METHODS.length && (
          <p className='text-xs text-muted-foreground mb-4'>
            Some payment methods aren&apos;t available in {activeCurrency} — switch your
            currency to unlock them, or continue with an option below.
          </p>
        )}

        <Form {...form}>
          <form
            method='post'
            className='space-y-5'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className='flex flex-col gap-3'
                    >
                      {availableMethods.map((paymentMethod) => {
                        const meta = PAYMENT_METHOD_META[paymentMethod];
                        const Icon = meta?.icon ?? Wallet;
                        const isSelected = field.value === paymentMethod;

                        return (
                          <label
                            key={paymentMethod}
                            htmlFor={paymentMethod}
                            className={cn(
                              'relative flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all',
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                                : 'border-border hover:border-primary/40 hover:bg-muted/30'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                                isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'
                              )}
                            >
                              <Icon className='w-4.5 h-4.5' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-semibold'>{paymentMethod}</p>
                              {meta?.description && (
                                <p className='text-xs text-muted-foreground mt-0.5'>{meta.description}</p>
                              )}
                            </div>
                            {isSelected && (
                              <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                                <Check className='w-3 h-3' />
                              </span>
                            )}
                            <FormControl>
                              <RadioGroupItem
                                id={paymentMethod}
                                value={paymentMethod}
                                checked={isSelected}
                                className='sr-only'
                              />
                            </FormControl>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isPending} className='w-full h-11 mt-2'>
              {isPending ? (
                <Loader className='w-4 h-4 animate-spin' />
              ) : (
                <ArrowRight className='w-4 h-4' />
              )}{' '}
              Continue to Review
            </Button>

            <p className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
              <ShieldCheck className='w-3 h-3' />
              All transactions are encrypted and PCI-compliant
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
