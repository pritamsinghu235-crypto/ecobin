"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { createMachine, type FormState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-[#04130d] transition-colors hover:bg-brand-bright disabled:opacity-60"
    >
      <Plus className="size-4" />
      {pending ? "Adding…" : "Add machine"}
    </button>
  );
}

export function MachineForm() {
  const [state, action] = useActionState<FormState, FormData>(createMachine, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Machine code" htmlFor="code">
          <Input id="code" name="code" placeholder="BIN-A09" required />
        </Field>
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" placeholder="Riverside Park" required />
        </Field>
      </div>
      <Field label="Address" htmlFor="address">
        <Input id="address" name="address" placeholder="12 River St" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude" htmlFor="lat">
          <Input id="lat" name="lat" type="number" step="any" placeholder="51.5074" required />
        </Field>
        <Field label="Longitude" htmlFor="lng">
          <Input id="lng" name="lng" type="number" step="any" placeholder="-0.1278" required />
        </Field>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-brand-bright">Machine added.</p>}

      <Submit />
    </form>
  );
}
