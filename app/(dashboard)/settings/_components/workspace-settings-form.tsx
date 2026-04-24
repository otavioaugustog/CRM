'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateWorkspace } from '@/app/actions/workspace'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(60),
  slug: z
    .string()
    .min(2, 'Slug deve ter ao menos 2 caracteres.')
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens.'),
})

type FormValues = z.infer<typeof schema>

interface WorkspaceSettingsFormProps {
  name: string
  slug: string
  isAdmin: boolean
}

export function WorkspaceSettingsForm({ name, slug, isAdmin }: WorkspaceSettingsFormProps) {
  const [isPending, setIsPending] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name, slug },
  })

  async function onSubmit(values: FormValues) {
    setIsPending(true)
    const result = await updateWorkspace(values.name, values.slug)
    setIsPending(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Workspace atualizado.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="ws-name">
          Nome do workspace
        </label>
        <input
          id="ws-name"
          {...register('name')}
          disabled={!isAdmin}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="ws-slug">
          Slug (URL amigável)
        </label>
        <div className="flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500">
          <span className="select-none border-r border-slate-200 px-3 py-2 text-sm text-slate-400">
            pipeflow.app/
          </span>
          <input
            id="ws-slug"
            {...register('slug')}
            disabled={!isAdmin}
            className="flex-1 rounded-r-md bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {errors.slug && <p className="text-xs text-rose-500">{errors.slug.message}</p>}
      </div>

      {isAdmin && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      )}
    </form>
  )
}
