"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { createReward, type FormState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-[#04130d] transition-colors hover:bg-brand-bright disabled:opacity-60"
    >
      <Plus className="size-4" />
      {pending ? "Adding…" : "Add reward"}
    </button>
  );
}

export function RewardForm() {
  const [state, action] = useActionState<FormState, FormData>(createReward, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" placeholder="Reusable Bottle" required />
      </Field>
      <Field label="Description" htmlFor="description">
        <Input id="description" name="description" placeholder="Stainless steel, 750ml" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cost (coins)" htmlFor="cost_coins">
          <Input id="cost_coins" name="cost_coins" type="number" min="0" placeholder="600" required />
        </Field>
        <Field label="Stock (blank = ∞)" htmlFor="stock">
          <Input id="stock" name="stock" type="number" min="0" placeholder="100" />
        </Field>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-brand-bright">Reward added.</p>}

      <Submit />
    </form>
  );
}
