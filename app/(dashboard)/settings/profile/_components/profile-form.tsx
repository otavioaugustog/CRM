'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/auth'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(80),
})

type FormValues = z.infer<typeof schema>

interface ProfileFormProps {
  name: string
}

export function ProfileForm({ name }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name },
  })

  async function onSubmit(values: FormValues) {
    setIsPending(true)
    const result = await updateProfile(values.name)
    setIsPending(false)
    if (result.error) toast.error(result.error)
    else toast.success('Perfil atualizado.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="profile-name">
          Nome completo
        </label>
        <input
          id="profile-name"
          {...register('name')}
          placeholder="Seu nome"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
