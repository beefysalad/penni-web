'use client'

import { useMutation } from '@tanstack/react-query'
import { createFeedback, type CreateFeedbackInput } from '@/api/finance/feedback.api'
import { useAuthenticatedRequest } from '@/hooks/use-authenticated-request'

export function useCreateFeedbackMutation() {
  const authenticatedRequest = useAuthenticatedRequest()

  return useMutation({
    mutationFn: (input: CreateFeedbackInput) =>
      authenticatedRequest((token) => createFeedback(token, input)),
  })
}
