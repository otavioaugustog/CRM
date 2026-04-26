'use client'

import { useState, useTransition } from 'react'
import { Trash2, X, TriangleAlert } from 'lucide-react'
import { deleteWorkspace } from '@/app/actions/workspace'
import { toast } from 'sonner'

interface DeleteWorkspaceDialogProps {
  workspaceName: string
}

export function DeleteWorkspaceDialog({ workspaceName }: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()

  const canDelete = confirm === workspaceName

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWorkspace()
      if ('error' in result) {
        toast.error(result.error)
        setOpen(false)
        return
      }
      // Hard reload para resetar o WorkspaceSwitcher (useState não limpa em soft navigation)
      window.location.href = '/dashboard'
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Excluir workspace
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                  <TriangleAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Excluir workspace</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta ação é <span className="font-semibold text-foreground">permanente e irreversível</span>.
                    Todos os leads, negócios, atividades e membros serão excluídos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setConfirm('') }}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="confirm-name">
                Digite <span className="font-semibold">{workspaceName}</span> para confirmar
              </label>
              <input
                id="confirm-name"
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={workspaceName}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirm('') }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || isPending}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isPending ? 'Excluindo…' : 'Excluir workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
