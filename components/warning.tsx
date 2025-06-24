"use client"

import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type ContentWarningDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ContentWarningDialog({ open, onOpenChange }: ContentWarningDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem("confessions-warning-dismissed", "true")
    }
    onOpenChange(false)
  }

  const handleLeave = () => {
    window.history.back()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="w-5 h-5" />
            Content Warning
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-left">
              <div>This website contains user-generated confessions that may include:</div>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>Mature themes and adult content (18+)</li>
                <li>Sensitive personal experiences</li>
                <li>Potentially disturbing or triggering material</li>
                <li>Strong language and explicit content</li>
              </ul>
              <div className="font-medium text-sm">Please proceed only if you are comfortable reading such content and are 18 years or older.</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            autoFocus={false}
          />
          <Label
            htmlFor="dont-show-again"
            className="text-sm"
          >
            Don't show this warning again
          </Label>
        </div>

        <DialogFooter className="sm:flex-row flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleLeave}
            className="w-full sm:w-auto"
          >
            Leave Site
          </Button>
          <Button
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            I Understand, Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
