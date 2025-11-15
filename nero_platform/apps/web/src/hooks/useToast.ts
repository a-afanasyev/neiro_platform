import { toast as sonnerToast } from 'sonner'

/**
 * Хук для отображения toast уведомлений
 * 
 * Использование:
 * const toast = useToast()
 * 
 * toast.success('Успешно!')
 * toast.error('Ошибка!')
 * toast.info('Информация')
 * toast.warning('Внимание!')
 */
export const useToast = () => {
  return {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
      })
    },

    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
      })
    },

    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
      })
    },

    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
      })
    },

    loading: (message: string) => {
      return sonnerToast.loading(message)
    },

    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      return sonnerToast.promise(promise, messages)
    },

    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId)
    },
  }
}

