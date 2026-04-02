'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function CategoriesPage() {
  const expenseCategoriesQuery = useCategoriesQuery('EXPENSE')
  const incomeCategoriesQuery = useCategoriesQuery('INCOME')
  const createCategoryMutation = useCreateCategoryMutation()

  const [form, setForm] = useState<CategoryForm>(DEFAULT_FORM)

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

  const handleCreateCategory = () => {
    const name = form.name.trim()
    if (!name) {
      toast.error('Category name is required.')
      return
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    createCategoryMutation.mutate(
      {
        name,
        slug: slug || `category-${Date.now()}`,
        type: form.type,
        colorHex: form.colorHex,
      },
      {
        onSuccess: () => {
          toast.success(`${name} added to your categories.`)
          setForm((current) => ({ ...current, name: '', colorHex: CATEGORY_COLORS[0] }))
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not create category.')
        },
      }
    )
  }

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
        <div className="flex items-center justify-between rounded-[24px] border border-[#17211c] bg-[#111916] px-4 py-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Finance setup</p>
            <p className="mt-1 text-[14px] font-medium text-[#93a19a]">Create categories here and keep your reporting tidy.</p>
          </div>
          <span className="rounded-full bg-[#16211b] px-3 py-1 text-[11px] font-bold text-[#41d6b2]">Live</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5">
              <div className="flex items-start justify-between gap-4">
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

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category name</Label>
                  <Input
                    id="category-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder={form.type === 'EXPENSE' ? 'e.g. Food, Bills, Shopping' : 'e.g. Salary, Freelance'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-type">Type</Label>
                  <select
                    id="category-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, type: event.target.value as CategoryType }))
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
                        onClick={() => setForm((current) => ({ ...current, colorHex: color }))}
                        className={`size-10 rounded-full border-2 transition ${
                          form.colorHex === color ? 'border-white/70 scale-105' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Use ${color} as category color`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleCreateCategory}
                  className="flex-1"
                  disabled={createCategoryMutation.isPending}
                >
                  <Plus className="size-4" />
                  {createCategoryMutation.isPending ? 'Saving...' : 'Add category'}
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#17211c] bg-[#101713] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">Live create flow</p>
              <h3 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">Connected to backend</h3>
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86]">
                This page now uses the real categories endpoint with axios plus TanStack Query, matching the separation we already use on mobile.
              </p>
            </div>
          </div>

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
      </div>
    </>
  )
}
