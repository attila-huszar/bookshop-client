import { toast as baseToast } from 'react-hot-toast'

let toastHost: HTMLElement | null = null
let toastDialog: HTMLDialogElement | null = null

export function syncToastHost() {
  if (!toastHost) return

  const dialog =
    document.activeElement?.closest<HTMLDialogElement>('dialog:modal') ??
    document.querySelector<HTMLDialogElement>('dialog:modal')

  if (toastDialog !== dialog) {
    toastDialog?.removeEventListener('close', syncToastHost)
    toastDialog = dialog
    toastDialog?.addEventListener('close', syncToastHost)
  }

  const parent = dialog ?? document.body
  if (toastHost.parentElement !== parent) parent.appendChild(toastHost)
}

export function registerToastHost(host: HTMLElement) {
  toastHost = host
  syncToastHost()

  return () => {
    toastDialog?.removeEventListener('close', syncToastHost)
    toastDialog = null
    toastHost = null
    host.remove()
  }
}

function withDialog<TArgs extends unknown[], TResult>(
  handler: (...args: TArgs) => TResult,
) {
  return (...args: TArgs): TResult => {
    syncToastHost()
    return handler(...args)
  }
}

export const toast: typeof baseToast = Object.assign(
  withDialog(baseToast),
  baseToast,
  {
    success: withDialog(baseToast.success),
    error: withDialog(baseToast.error),
    loading: withDialog(baseToast.loading),
    custom: withDialog(baseToast.custom),
    promise<T>(...args: Parameters<typeof baseToast.promise<T>>) {
      syncToastHost()
      return baseToast.promise<T>(...args).then(
        (value) => {
          syncToastHost()
          return value
        },
        (error: unknown) => {
          syncToastHost()
          throw error
        },
      )
    },
  },
)
