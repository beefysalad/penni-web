import api from '@/lib/axios'

export type FeedbackTypeApi =
  | 'BUG_REPORT'
  | 'GENERAL_FEEDBACK'
  | 'FEATURE_REQUEST'
  | 'SHOW_SOME_LOVE'

export type MoodApi = 'FRUSTRATED' | 'UNHAPPY' | 'NEUTRAL' | 'HAPPY' | 'LOVING_IT'

export type Feedback = {
  id: string
  userId: string
  feedbackType: FeedbackTypeApi
  message: string
  mood: MoodApi
  email: string | null
  createdAt: string
  updatedAt: string
}

export type CreateFeedbackInput = {
  feedbackType: FeedbackTypeApi
  message: string
  mood: MoodApi
  email?: string
}

export async function createFeedback(token: string, input: CreateFeedbackInput) {
  const response = await api.post<Feedback>('/feedback', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
