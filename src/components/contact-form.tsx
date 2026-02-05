"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as React from 'react';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  phone: z.string().regex(/^\+\d{10,14}$/, {
    message: "Por favor, ingresá un número de teléfono válido (ej: +5493564504977).",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }),
});


const PhoneInput = React.forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
  }
>(({ value = '', onChange, className }, ref) => {
  const getInitialParts = React.useCallback((v: string) => {
    const digits = v.replace(/\D/g, '');
    const country = digits.slice(0, 2);
    const mobilePrefix = digits.slice(2, 3);
    const area = digits.slice(3, 7);
    const local = digits.slice(7, 13);
    return { country, mobilePrefix, area, local };
  }, []);

  const [country, setCountry] = React.useState(() => getInitialParts(value).country);
  const [mobilePrefix, setMobilePrefix] = React.useState(() => getInitialParts(value).mobilePrefix);
  const [area, setArea] = React.useState(() => getInitialParts(value).area);
  const [local, setLocal] = React.useState(() => getInitialParts(value).local);

  const mobilePrefixRef = React.useRef<HTMLInputElement>(null);
  const areaRef = React.useRef<HTMLInputElement>(null);
  const localRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const newCombined = `+${country}${mobilePrefix}${area}${local}`;
    if (value !== newCombined) {
      const { country, mobilePrefix, area, local } = getInitialParts(value);
      setCountry(country);
      setMobilePrefix(mobilePrefix);
      setArea(area);
      setLocal(local);
    }
  }, [value, country, mobilePrefix, area, local, getInitialParts]);

  const triggerChange = (parts: { country: string; mobilePrefix: string; area: string; local: string }) => {
    if (onChange) {
      const fullNumber = `+${parts.country}${parts.mobilePrefix}${parts.area}${parts.local}`;
      onChange(fullNumber);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCountry(val);
    triggerChange({ country: val, mobilePrefix, area, local });
    if (val.length === 2 && mobilePrefixRef.current) {
      mobilePrefixRef.current.focus();
    }
  };

  const handleMobilePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobilePrefix(val);
    triggerChange({ country, mobilePrefix: val, area, local });
    if (val.length === 1 && areaRef.current) {
      areaRef.current.focus();
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setArea(val);
    triggerChange({ country, mobilePrefix, area: val, local });
    if (val.length === 4 && localRef.current) {
      localRef.current.focus();
    }
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setLocal(val);
    triggerChange({ country, mobilePrefix, area, local: val });
  };

  return (
    <div
      className={cn(
        'flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <div className="flex items-center pl-3">
        <span className="text-muted-foreground">+</span>
        <Input
          ref={ref}
          type="tel"
          placeholder="54"
          maxLength={2}
          value={country}
          onChange={handleCountryChange}
          className="w-8 border-0 p-0 shadow-none focus-visible:ring-0"
          style={{ height: '30px' }}
        />
      </div>
      <div className="h-4 w-[1px] bg-border" />
      <Input
        ref={mobilePrefixRef}
        type="tel"
        placeholder="9"
        maxLength={1}
        value={mobilePrefix}
        onChange={handleMobilePrefixChange}
        className="w-6 border-0 p-0 shadow-none focus-visible:ring-0"
        style={{ height: '30px' }}
      />
      <div className="h-4 w-[1px] bg-border" />
      <Input
        ref={areaRef}
        type="tel"
        placeholder="3564"
        maxLength={4}
        value={area}
        onChange={handleAreaChange}
        className="w-14 border-0 p-0 shadow-none focus-visible:ring-0"
        style={{ height: '30px' }}
      />
      <div className="h-4 w-[1px] bg-border" />
      <Input
        ref={localRef}
        type="tel"
        placeholder="504977"
        maxLength={6}
        value={local}
        onChange={handleLocalChange}
        className="flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
        style={{ height: '30px' }}
      />
    </div>
  );
});
PhoneInput.displayName = 'PhoneInput';


export function ContactForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "+54",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(values);
    
    toast({
      title: (
        <div className="flex items-center gap-4">
          <Image
            src="/LOGO1.png"
            alt="Logo"
            width={40}
            height={40}
            className="h-auto"
          />
          <span>¡Mensaje enviado!</span>
        </div>
      ),
      description: "Gracias por tu consulta. Nos pondremos en contacto a la brevedad.",
    });

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Teléfono</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Mensaje</FormLabel>
              <FormControl>
                <Textarea placeholder="Escribí tu consulta..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-full">
          {form.formState.isSubmitting ? "Enviando..." : "Enviar Consulta"}
        </Button>
      </form>
    </Form>
  );
}
