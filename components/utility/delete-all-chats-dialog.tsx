import { FC } from "react"
import { DialogPanel, DialogTitle } from "@headlessui/react"
import { Button } from "../ui/button"
import { TransitionedDialog } from "../ui/transitioned-dialog"

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmButtonText?: string
}

export const DeleteDialog: FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Delete"
}) => {
  return (
    <TransitionedDialog isOpen={isOpen} onClose={onClose}>
      <DialogPanel className="bg-popover w-full max-w-md overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
        <DialogTitle
          as="h3"
          className="text-center text-lg font-medium leading-6"
        >
          {title}
        </DialogTitle>
        <div className="mt-2">
          <p className="text-center text-sm">{message}</p>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        </div>
      </DialogPanel>
    </TransitionedDialog>
  )
}
