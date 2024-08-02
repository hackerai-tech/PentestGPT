import { FC, useState } from "react"
import { DialogPanel, DialogTitle } from "@headlessui/react"
import { Button } from "../ui/button"
import { TransitionedDialog } from "../ui/transitioned-dialog"
import { Input } from "../ui/input"

interface MultiStepDeleteAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userEmail: string
}

export const MultiStepDeleteAccountDialog: FC<
  MultiStepDeleteAccountDialogProps
> = ({ isOpen, onClose, onConfirm, userEmail }) => {
  const [step, setStep] = useState(1)
  const [confirmEmail, setConfirmEmail] = useState("")

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirm = () => {
    if (confirmEmail.toLowerCase() === userEmail.toLowerCase()) {
      onConfirm()
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="text-center text-sm">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleNextStep}>
                Continue
              </Button>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <p className="text-center text-sm">
              Deleting your account will remove all your data, including chats,
              settings, and personal information.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Button onClick={handlePreviousStep}>Back</Button>
              <Button variant="destructive" onClick={handleNextStep}>
                I understand, continue
              </Button>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <p className="mb-4 text-center text-sm">
              To confirm account deletion, please enter your email address:{" "}
              {userEmail}
            </p>
            <Input
              type="email"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder="Enter your email"
              className="mb-4"
            />
            <div className="flex justify-center space-x-4">
              <Button onClick={handlePreviousStep}>Back</Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={
                  confirmEmail.toLowerCase() !== userEmail.toLowerCase()
                }
              >
                Delete Account
              </Button>
            </div>
          </>
        )
    }
  }

  return (
    <TransitionedDialog isOpen={isOpen} onClose={onClose}>
      <DialogPanel className="bg-popover w-full max-w-md overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
        <DialogTitle
          as="h3"
          className="mb-4 text-center text-lg font-medium leading-6"
        >
          Delete Account - Step {step} of 3
        </DialogTitle>
        {renderStepContent()}
      </DialogPanel>
    </TransitionedDialog>
  )
}
