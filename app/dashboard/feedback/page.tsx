'use client'

import type { FeedbackTypeApi, MoodApi } from '@/api/finance/feedback.api'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import FormErrorMessage from '@/components/ui/form-error-message'
import { useCreateFeedbackMutation } from '@/hooks/finance/use-feedback-query'
import { handleApiError } from '@/lib/error-handler'
import { cn } from '@/lib/utils'
import {
  Angry,
  Bug,
  Frown,
  Heart,
  Lightbulb,
  Meh,
  MessageSquare,
  PartyPopper,
  Send,
  Smile,
} from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { StarRating } from './_components/star-rating'

const FEEDBACK_TYPES = [
  {
    value: 'bug',
    label: 'Bug report',
    description: 'Something is broken or not working as expected.',
    icon: Bug,
    iconBg: 'bg-[#241719]',
    iconColor: 'text-[#ff8a94]',
    activeBg: 'bg-[#241719]/60 border-[#ff8a94]/30',
    activeAccent: 'text-[#ff8a94]',
  },
  {
    value: 'feature',
    label: 'Feature request',
    description: "Suggest something new you'd love to see.",
    icon: Lightbulb,
    iconBg: 'bg-[#2a2518]',
    iconColor: 'text-[#ffc857]',
    activeBg: 'bg-[#2a2518]/60 border-[#ffc857]/30',
    activeAccent: 'text-[#ffc857]',
  },
  {
    value: 'general',
    label: 'General feedback',
    description: 'Share thoughts, praise, or anything on your mind.',
    icon: MessageSquare,
    iconBg: 'bg-[#1e1c2e]',
    iconColor: 'text-[#a084ff]',
    activeBg: 'bg-[#1e1c2e]/60 border-[#a084ff]/30',
    activeAccent: 'text-[#a084ff]',
  },
  {
    value: 'love',
    label: 'Show some love',
    description: 'Tell us what you enjoy most about Penni.',
    icon: Heart,
    iconBg: 'bg-[#1f1520]',
    iconColor: 'text-[#e879a0]',
    activeBg: 'bg-[#1f1520]/60 border-[#e879a0]/30',
    activeAccent: 'text-[#e879a0]',
  },
] as const

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['value']

const MOODS = [
  { value: 1, icon: Angry, label: 'Frustrated', color: '#ff8a94' },
  { value: 2, icon: Frown, label: 'Unhappy', color: '#ffc857' },
  { value: 3, icon: Meh, label: 'Neutral', color: '#93a19a' },
  { value: 4, icon: Smile, label: 'Happy', color: '#41d6b2' },
  { value: 5, icon: PartyPopper, label: 'Loving it', color: '#8bff62' },
] as const

type Mood = (typeof MOODS)[number]['value']

const QUICK_TAGS = [
  'UI / Design',
  'Performance',
  'Budgets',
  'Recurring items',
  'Activity log',
  'Accounts',
  'Categories',
  'Notifications',
  'Mobile experience',
  'Data accuracy',
]

type FeedbackForm = {
  feedbackType: FeedbackType
  mood: Mood | null
  selectedTags: string[]
  message: string
  email: string
}

const DEFAULT_VALUES: FeedbackForm = {
  feedbackType: 'general',
  mood: null,
  selectedTags: [],
  message: '',
  email: '',
}

const feedbackTypeMap: Record<FeedbackType, FeedbackTypeApi> = {
  bug: 'BUG_REPORT',
  feature: 'FEATURE_REQUEST',
  general: 'GENERAL_FEEDBACK',
  love: 'SHOW_SOME_LOVE',
}

const moodMap: Record<Mood, MoodApi> = {
  1: 'FRUSTRATED',
  2: 'UNHAPPY',
  3: 'NEUTRAL',
  4: 'HAPPY',
  5: 'LOVING_IT',
}

export default function FeedbackPage() {
  const createFeedbackMutation = useCreateFeedbackMutation()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackForm>({
    defaultValues: DEFAULT_VALUES,
  })

  const feedbackType = useWatch({ control, name: 'feedbackType' })
  const mood = useWatch({ control, name: 'mood' })
  const selectedTags = useWatch({ control, name: 'selectedTags' }) ?? []
  const message = useWatch({ control, name: 'message' }) ?? ''
  const email = useWatch({ control, name: 'email' }) ?? ''

  const selectedType = FEEDBACK_TYPES.find((t) => t.value === feedbackType)!
  const charLimit = 1000
  const isOverLimit = message.length > charLimit
  const trimmedMessage = message.trim()
  const trimmedEmail = email.trim()

  const canSubmit =
    trimmedMessage.length > 0 &&
    !isOverLimit &&
    mood !== null &&
    !errors.email &&
    !createFeedbackMutation.isPending &&
    !isSubmitting

  const toggleTag = (tag: string) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((value) => value !== tag)
      : [...selectedTags, tag]

    setValue('selectedTags', nextTags, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const onSubmit = async (values: FeedbackForm) => {
    const nextMessage = values.message.trim()
    const nextEmail = values.email.trim()

    if (values.mood === null) {
      setError('mood', {
        type: 'manual',
        message: 'Pick a mood so the feedback has some context.',
      })
      return
    }

    if (nextMessage.length > charLimit) {
      setError('message', {
        type: 'manual',
        message: 'Feedback message is too long.',
      })
      return
    }

    clearErrors(['mood', 'message'])

    const finalMessage =
      values.selectedTags.length > 0
        ? `${nextMessage}\n\nTags: ${values.selectedTags.join(', ')}`
        : nextMessage

    try {
      await createFeedbackMutation.mutateAsync({
        feedbackType: feedbackTypeMap[values.feedbackType],
        message: finalMessage,
        mood: moodMap[values.mood],
        ...(nextEmail ? { email: nextEmail } : {}),
      })

      toast.success('Feedback sent. Thanks for helping improve Penni.')
      reset(DEFAULT_VALUES)
    } catch (error) {
      try {
        handleApiError(error)
      } catch (handledError) {
        setError('root', {
          type: 'server',
          message:
            handledError instanceof Error
              ? handledError.message
              : 'Could not send feedback.',
        })
      }
    }
  }

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Support"
          title="Send Feedback"
          subtitle="Help me make Penni better. Every note gets read by me."
          inverted
        />
      </DashboardHeaderShell>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 px-4 pt-6 pb-28 md:px-6 lg:px-8"
      >
        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Feedback type
          </p>
          <h2 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            What brings you here?
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map((type) => {
              const Icon = type.icon
              const isActive = feedbackType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setValue('feedbackType', type.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                  className={cn(
                    'flex items-start gap-4 rounded-[22px] border p-4 text-left transition-all duration-200',
                    isActive
                      ? `${type.activeBg} border`
                      : 'border-[#17211c] bg-[#111916] hover:bg-[#131b17]'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      type.iconBg
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-5',
                        isActive ? type.iconColor : 'text-[#4a5650]'
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-[14px] font-bold',
                        isActive ? type.activeAccent : 'text-[#f4f7f5]'
                      )}
                    >
                      {type.label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed font-medium text-[#7f8c86]">
                      {type.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Overall feeling
          </p>
          <h2 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            How are you feeling about Penni?
          </h2>

          <div className="mt-5 flex items-center justify-between gap-2">
            {MOODS.map((entry) => {
              const Icon = entry.icon
              const isActive = mood === entry.value
              return (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => {
                    setValue('mood', entry.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                    clearErrors('mood')
                    void trigger('mood')
                  }}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-2 rounded-[20px] border py-4 transition-all duration-200',
                    isActive
                      ? 'scale-105 border-[#17211c] bg-[#131b17]'
                      : 'border-transparent hover:bg-[#111916]'
                  )}
                  aria-label={entry.label}
                >
                  <Icon
                    className="size-7 transition-colors"
                    style={{ color: isActive ? entry.color : '#4a5650' }}
                  />
                  <span
                    className={cn(
                      'hidden text-[10px] font-bold tracking-wide uppercase transition-colors sm:block',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                    style={{ color: entry.color }}
                  >
                    {entry.label}
                  </span>
                </button>
              )
            })}
          </div>

          {mood !== null ? (
            <p
              className="mt-3 text-center text-[12px] font-bold tracking-wider uppercase sm:hidden"
              style={{
                color: MOODS.find((entry) => entry.value === mood)?.color,
              }}
            >
              {MOODS.find((entry) => entry.value === mood)?.label}
            </p>
          ) : null}
          <FormErrorMessage message={errors.mood?.message} />
        </div>

        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Topic tags
          </p>
          <h2 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            What area does this relate to?
          </h2>
          <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">
            Optional — pick all that apply.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-150',
                    isActive
                      ? 'border-[#8bff62]/40 bg-[#8bff62]/10 text-[#8bff62]'
                      : 'border-[#17211c] bg-[#111916] text-[#7f8c86] hover:border-[#2a3a31] hover:text-[#f4f7f5]'
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
                Your message
              </p>
              <h2 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
                Tell me more
              </h2>
            </div>
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                selectedType.iconBg
              )}
            >
              <selectedType.icon
                className={cn('size-5', selectedType.iconColor)}
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="relative">
              <textarea
                id="feedback-message"
                {...register('message', {
                  required: 'Please add a message before sending feedback.',
                  validate: (value) =>
                    (value.trim().length > 0 && value.length <= charLimit) ||
                    (value.length > charLimit
                      ? 'Feedback message is too long.'
                      : 'Please add a message before sending feedback.'),
                })}
                rows={6}
                placeholder={
                  feedbackType === 'bug'
                    ? 'Describe what happened, what you expected, and the steps to reproduce it…'
                    : feedbackType === 'feature'
                      ? 'What would you like to see? How would it help your workflow?'
                      : feedbackType === 'love'
                        ? "What do you enjoy most about Penni? We'd love to hear it!"
                        : "Share anything — good, bad, or just thoughts you'd like us to know…"
                }
                className={cn(
                  'w-full resize-none rounded-[22px] border bg-[#111916] px-5 py-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none placeholder:text-[#4a5650]',
                  isOverLimit
                    ? 'border-[#ff8a94]/50 focus:border-[#ff8a94]'
                    : 'border-[#17211c] focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30'
                )}
              />
              <div
                className={cn(
                  'absolute right-4 bottom-4 text-[11px] font-bold',
                  isOverLimit
                    ? 'text-[#ff8a94]'
                    : message.length > charLimit * 0.8
                      ? 'text-[#ffc857]'
                      : 'text-[#4a5650]'
                )}
              >
                {message.length} / {charLimit}
              </div>
            </div>
            <FormErrorMessage message={errors.message?.message} />

            <div className="space-y-2">
              <label
                htmlFor="feedback-email"
                className="text-[12px] font-bold tracking-[1.8px] text-[#4a5650] uppercase"
              >
                Reply-to email{' '}
                <span className="tracking-normal text-[#4a5650]/60 normal-case">
                  (optional)
                </span>
              </label>
              <input
                id="feedback-email"
                type="email"
                {...register('email', {
                  validate: (value) =>
                    value.trim().length === 0 ||
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                    'Please enter a valid email address.',
                })}
                placeholder="you@example.com"
                className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none placeholder:text-[#4a5650] focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
              />
              <FormErrorMessage message={errors.email?.message} />
              <p className="text-[12px] font-medium text-[#7f8c86]">
                Add your email if you want a reply. We never share it.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            App rating
          </p>
          <h2 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            Rate your experience
          </h2>
          <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">
            Optional — how would you rate Penni overall?
          </p>

          <StarRating
            value={mood}
            onChange={(value) => {
              setValue('mood', value as Mood, {
                shouldDirty: true,
                shouldTouch: true,
              })
              void trigger('mood')
            }}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!canSubmit}
        >
          <Send className="size-4" />
          {createFeedbackMutation.isPending
            ? 'Sending feedback...'
            : 'Send feedback'}
        </Button>
        <FormErrorMessage message={errors.root?.message} />
      </form>
    </>
  )
}
