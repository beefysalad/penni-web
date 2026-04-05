'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import FormErrorMessage from '@/components/ui/form-error-message'
import { CategoryRow, FinanceEmptyState } from '@/components/finance/management-components'
import { useCategoriesQuery, useCreateCategoryMutation } from '@/hooks/finance/use-categories-query'
import type { CategoryType } from '@/lib/finance.types'
import { CATEGORY_COLORS, CATEGORY_TYPES } from '@/lib/constants'
import { Plus, Tags } from 'lucide-react'

type CategoryForm = {
  name: string
  type: CategoryType
  colorHex: string
}

const DEFAULT_FORM: CategoryForm = {
  name: '',
  type: 'EXPENSE',
  colorHex: CATEGORY_COLORS[0],
}

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.'),
  type: z.enum(['EXPENSE', 'INCOME']),
  colorHex: z.string().min(1, 'Choose a category color.'),
})

export default function CategoriesPage() {
  const expenseCategoriesQuery = useCategoriesQuery('EXPENSE')
  const incomeCategoriesQuery = useCategoriesQuery('INCOME')
  const createCategoryMutation = useCreateCategoryMutation()

  const [showComposer, setShowComposer] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: DEFAULT_FORM,
  })

  const type = useWatch({ control, name: 'type' })
  const colorHex = useWatch({ control, name: 'colorHex' })

  const categories = useMemo(
    () => [...(expenseCategoriesQuery.data ?? []), ...(incomeCategoriesQuery.data ?? [])],
    [expenseCategoriesQuery.data, incomeCategoriesQuery.data]
  )

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'EXPENSE'),
    [categories]
  )
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'INCOME'),
    [categories]
  )

  const isLoading = expenseCategoriesQuery.isLoading || incomeCategoriesQuery.isLoading

  const handleCreateCategory = (values: CategoryForm) => {
    const name = values.name.trim()

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    createCategoryMutation.mutate(
      {
        name,
        slug: slug || `category-${crypto.randomUUID()}`,
        type: values.type,
        colorHex: values.colorHex,
      },
      {
        onSuccess: () => {
          toast.success(`${name} added to your categories.`)
          reset(DEFAULT_FORM)
          setShowComposer(false)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not create category.')
        },
      }
    )
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleCreateCategory)}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">Create category</p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">Add a new label</h2>
          <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86]">
            Keep the naming clean so stats and AI insights stay readable later.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Tags className="size-5 text-[#8bff62]" />
        </div>
      </div>

      <div className="mt-6 space-y-5 max-lg:mt-0">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category name</Label>
          <Input
            id="category-name"
            {...register('name')}
            placeholder={type === 'EXPENSE' ? 'e.g. Food, Bills, Shopping' : 'e.g. Salary, Freelance'}
          />
          <FormErrorMessage message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-type">Type</Label>
          <select
            id="category-type"
            value={type}
            onChange={(event) =>
              setValue('type', event.target.value as CategoryType, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            {CATEGORY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <Label>Accent color</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setValue('colorHex', color, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                className={`size-10 rounded-full border-2 transition ${
                  colorHex === color ? 'border-white/70 scale-105' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Use ${color} as category color`}
              />
            ))}
          </div>
          <FormErrorMessage message={errors.colorHex?.message} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={createCategoryMutation.isPending}
        >
          <Plus className="size-4" />
          {createCategoryMutation.isPending ? 'Saving...' : 'Add category'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset(DEFAULT_FORM)
            setShowComposer(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Category manager"
          title="Categories"
          subtitle="Create and review the labels Penni uses for spending and income."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pb-28 pt-6 md:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Finance setup</p>
              <p className="mt-1 text-[14px] font-medium text-[#93a19a]">
                Create categories here and keep your reporting tidy.
              </p>
            </div>
            <Button onClick={() => setShowComposer((current) => !current)} className="lg:self-stretch">
              <Plus className="size-4" />
              {showComposer ? 'Close composer' : 'New category'}
            </Button>
          </div>
        </div>

        {showComposer ? <div className="hidden lg:block">{composerContent}</div> : null}

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">Expense categories</h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">What you spend on day to day.</p>
              </div>
              <span className="rounded-full bg-[#241719] px-3 py-1 text-[11px] font-bold text-[#ff8a94]">
                {expenseCategories.length} total
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-14 rounded-[20px] bg-[#131b17] animate-pulse" />
                  <div className="h-14 rounded-[20px] bg-[#131b17] animate-pulse" />
                  <div className="h-14 rounded-[20px] bg-[#131b17] animate-pulse" />
                </div>
              ) : expenseCategories.length > 0 ? (
                expenseCategories.map((category, index) => (
                  <CategoryRow key={category.id} category={category} isLast={index === expenseCategories.length - 1} />
                ))
              ) : (
                <div className="p-4">
                  <FinanceEmptyState
                    icon={Tags}
                    title="No expense categories yet"
                    description="Create your first expense label here so spending can stay organized."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">Income categories</h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">Salary, freelance, side income, and more.</p>
              </div>
              <span className="rounded-full bg-[#16211b] px-3 py-1 text-[11px] font-bold text-[#41d6b2]">
                {incomeCategories.length} total
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-14 rounded-[20px] bg-[#131b17] animate-pulse" />
                  <div className="h-14 rounded-[20px] bg-[#131b17] animate-pulse" />
                </div>
              ) : incomeCategories.length > 0 ? (
                incomeCategories.map((category, index) => (
                  <CategoryRow key={category.id} category={category} isLast={index === incomeCategories.length - 1} />
                ))
              ) : (
                <div className="p-4">
                  <FinanceEmptyState
                    icon={Tags}
                    title="No income categories yet"
                    description="Create a few labels so income sources stay readable across the app."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileSheet
        open={showComposer}
        onClose={() => setShowComposer(false)}
        eyebrow="Categories"
        title="New category"
      >
        {composerContent}
      </MobileSheet>
    </>
  )
}
