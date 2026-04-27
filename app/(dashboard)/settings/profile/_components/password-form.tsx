'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updatePassword } from '@/app/actions/auth'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: z.string().min(8, 'Nova senha deve ter ao menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function PasswordForm() {
  const [isPending, setIsPending] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setIsPending(true)
    const result = await updatePassword(values.currentPassword, values.newPassword)
    setIsPending(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Senha alterada com sucesso.')
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="current-password">
          Senha atual
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="new-password">
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
          Confirmar nova senha
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Alterando…' : 'Alterar senha'}
        </button>
      </div>
    </form>
  )
}
