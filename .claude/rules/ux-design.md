# UX Design Rules — Daily Tracker

These rules govern all UI implementation decisions in this project. Follow them strictly when building, reviewing, or modifying any component.

---

## 1. Component Hierarchy

Always follow this decision order before writing any UI code:

1. **Use a shadcn/ui component** from `components/ui/` if one exists that covers the use case.
2. **Compose from shadcn primitives** (Radix UI under the hood) if a new variant or pattern is needed but no existing shadcn component fits.
3. **Build a custom component** using Radix UI primitives directly (`@radix-ui/*`) when shadcn primitives are insufficient.
4. **Build fully custom** using semantic HTML + Tailwind only as a last resort — document why in a code comment.

Never use third-party component libraries other than those already installed. Never add a new UI dependency without strong justification.

---

## 2. Accessibility (Non-Negotiable)

Every UI element must meet WCAG 2.1 AA. These are hard requirements, not suggestions.

### Interactive Elements
- Every `<button>`, `<input>`, `<select>`, `<textarea>` must have an accessible name — either via `<label>`, `aria-label`, or `aria-labelledby`.
- Icon-only buttons **must** include `<span className="sr-only">Description</span>` or `aria-label`.
- Disabled elements use `aria-disabled` instead of (or in addition to) the `disabled` attribute when they remain in the tab order.
- All clickable elements must be keyboard-reachable and operable with Enter/Space.

### Focus Management
- Use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` for focus indicators — never suppress focus outlines without a visible alternative.
- Dialogs and sheets trap focus using Radix `Dialog`/`Sheet` primitives — do not re-implement focus trapping manually.
- After closing a dialog, return focus to the element that opened it (Radix handles this automatically — do not override).

### ARIA Patterns
```tsx
// Forms — connect error messages
<FormField
  render={({ field }) => (
    <FormItem>
      <FormLabel>Amount</FormLabel>
      <FormControl>
        <Input aria-describedby="amount-desc" {...field} />
      </FormControl>
      <FormDescription id="amount-desc">Enter amount in INR</FormDescription>
      <FormMessage /> {/* sets aria-invalid and aria-describedby automatically */}
    </FormItem>
  )}
/>

// Loading states
<div role="status" aria-label="Loading expenses">
  <Skeleton className="h-4 w-full" />
  <span className="sr-only">Loading expenses</span>
</div>

// Alerts
<Alert role="alert" variant="destructive">  {/* role="alert" for errors */}
  <AlertDescription>Failed to save.</AlertDescription>
</Alert>
```

### Semantic HTML
- Use `<nav>` for navigation, `<main>` for page content, `<section>` for grouped content with a heading, `<article>` for self-contained blocks.
- Use `<h1>`–`<h6>` in logical order — never skip heading levels.
- Use `<table>`, `<thead>`, `<tbody>`, `<th scope="col/row">` for tabular data. Never fake a table with divs.
- Forms use `<form>` with a submit `<button type="submit">`, not a div with an onClick.

---

## 3. Typography

### Font Stack
- Sans-serif UI text: `font-sans` → Geist (var: `--font-geist-sans`)
- Monospace / numeric data: `font-mono` → Geist Mono (var: `--font-geist-mono`)

### Scale
| Usage | Classes |
|---|---|
| Page title (h1) | `text-2xl md:text-3xl font-bold tracking-tight` |
| Section heading (h2) | `text-xl font-semibold` |
| Card / subsection (h3) | `text-lg font-semibold` |
| Label / subheading | `text-sm font-medium` |
| Body default | `text-sm` |
| Supporting / meta | `text-xs text-muted-foreground` |
| Monospace numbers | `font-mono tabular-nums` |

- Use `text-muted-foreground` for descriptive / secondary text.
- Use `text-destructive` only for error states.
- Never hardcode color values — always use CSS variable tokens.
- Use `truncate` or `line-clamp-*` for text overflow; never let text break layout.

---

## 4. Color & Theming

### Design Tokens (use these, never raw colors)
```
--color-background / --color-foreground
--color-primary / --color-primary-foreground
--color-secondary / --color-secondary-foreground
--color-accent / --color-accent-foreground
--color-muted / --color-muted-foreground
--color-destructive
--color-border / --color-input / --color-ring
--color-card / --color-card-foreground
--color-sidebar / --color-sidebar-foreground
--color-chart-1 … --color-chart-5
```

### Rules
- All components must work in both light and dark mode. Test dark mode during development.
- Use `bg-background`, `text-foreground`, `border-border` — not `bg-white` or `text-black`.
- Use `bg-muted` for secondary backgrounds (e.g., table header rows, code blocks, empty states).
- Status colors: destructive = errors/delete, primary = main CTA, secondary = secondary actions.
- Chart colors always use `--color-chart-1` through `--color-chart-5` in that order for consistency.

---

## 5. Spacing & Layout

### Spacing Scale
- Internal component spacing: `gap-1` (4px) to `gap-4` (16px)
- Section spacing: `gap-6` (24px) to `gap-8` (32px)
- Page-level padding: `p-4 md:p-6`
- Card internal padding: `p-4` or `p-6`

### Layout Primitives
```tsx
// Vertical stack
<div className="flex flex-col gap-4">

// Horizontal row
<div className="flex items-center gap-2">

// Two-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Stats grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Centered max-width container
<div className="max-w-6xl mx-auto px-4">
```

### Responsive Breakpoints
- Mobile-first — default styles target mobile, use `md:` and `lg:` prefixes to enhance.
- `md:` (768px) — transition from stacked to side-by-side layouts.
- `lg:` (1024px) — expand grids, show additional columns.
- Never hide critical content or actions on mobile — relocate them instead.
- Use `hidden md:flex` / `md:hidden` for layout-specific visibility only.

---

## 6. Forms

### Standard Form Pattern
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input placeholder="Placeholder" {...field} />
          </FormControl>
          <FormDescription>Helper text if needed</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? (
        <><Spinner className="mr-2 h-4 w-4" />Saving…</>
      ) : (
        "Save"
      )}
    </Button>
  </form>
</Form>
```

### Form Rules
- Always use `react-hook-form` + `zod` for validation. Never write manual validation logic.
- Every field needs a `<FormLabel>`. Use `<FormDescription>` for hints; `<FormMessage>` for errors.
- Show inline error messages under the field — never use alert boxes for individual field errors.
- Disable the submit button while `isSubmitting` and show a spinner.
- Use `<Select>` for 4+ options, `<Checkbox>` for boolean toggles, `<Textarea>` for multi-line input.
- Date inputs always use the `DateRangePicker` or `Calendar` + `Popover` pattern — never a plain text input for dates.
- Number inputs for currency use `font-mono tabular-nums` class.

---

## 7. Data Tables

Use the project's generic `<DataTable>` component for all tabular data.

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
/>
```

### Column Definition Rules
- Every `<TableHead>` must have `scope="col"`.
- Sortable columns use `ArrowUpDown` icon at rest; `ArrowUp` / `ArrowDown` when sorted.
- Numeric / currency columns: right-align with `text-right font-mono tabular-nums`.
- Action columns (edit/delete): use icon-only buttons with `aria-label` for each row action.
- Empty state: render a `<TableCell colSpan={columns.length}>` with a descriptive message.
- Loading state: render `<Skeleton>` rows matching the default page size.

---

## 8. Dialogs & Overlays

### When to use each
| Component | Use case |
|---|---|
| `<Dialog>` | Operations requiring user input |
| `<AlertDialog>` | Destructive confirmation (delete, reset) |
| `<Sheet>` | Contextual side panels (filters, details) |
| `<Popover>` | Compact inline controls (date pickers, quick filters) |
| `<Tooltip>` | Supplementary info only — never for critical actions |

```tsx
// Destructive confirmation pattern
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="icon" aria-label="Delete expense">
      <TrashIcon className="h-4 w-4" aria-hidden="true" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- Every `<DialogContent>` requires `<DialogTitle>` — use `<VisuallyHidden>` from Radix if visually hidden.
- Every `<DialogContent>` requires `<DialogDescription>` or `aria-describedby={undefined}` to suppress the Radix warning.

---

## 9. Buttons

### Variant Usage
| Variant | When to use |
|---|---|
| `default` | Primary CTA per section — one per visible area |
| `secondary` | Secondary action alongside a primary |
| `outline` | Tertiary actions, toggle-like buttons |
| `ghost` | Navigation items, icon buttons in toolbars |
| `destructive` | Delete, remove, reset — irreversible actions |
| `link` | Inline text links within paragraphs |

### Size Usage
| Size | When to use |
|---|---|
| `default` | Standard form/page buttons |
| `sm` | Table row actions, compact UI areas |
| `lg` | Hero CTAs, empty state actions |
| `icon` | Square icon-only buttons |

### Rules
- Never use more than one `default` (primary) button per card/form/section.
- Loading state: disable button + show `<Spinner>` + update label text (e.g., "Saving…").
- Destructive actions always require confirmation via `<AlertDialog>` — no immediate execution on click.

---

## 10. Cards & Page Layout

### Standard Page Structure
```tsx
<div className="flex flex-col gap-6 p-4 md:p-6">
  <PageTitle
    title="Expenses"
    subtitle="Track your spending"
    action={<Button>Add Expense</Button>}
  />

  {/* Stats row */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatsCard label="Total" value="₹12,400" trend="up" />
  </div>

  {/* Main content */}
  <Card>
    <CardHeader>
      <CardTitle>Recent Transactions</CardTitle>
      <CardDescription>Last 30 days</CardDescription>
    </CardHeader>
    <CardContent>
      <DataTable columns={columns} data={data} />
    </CardContent>
  </Card>
</div>
```

### Card Rules
- Always include `<CardHeader>` with at least `<CardTitle>` for standalone cards.
- Use `<CardDescription>` for subtitle/context beneath the title.
- Charts must be wrapped in `<Card>` with a `<CardHeader>` labeling the metric.

---

## 11. Feedback & State

### Loading States
- Show `<Skeleton>` for content replacing a known layout (tables, cards, text blocks).
- Show `<Spinner>` inside buttons during async actions (`isSubmitting`, `isDeleting`).
- Never show a blank screen while data loads — always render skeletons.

### Error States
- Network/API errors: `<Alert variant="destructive">` with a retry action when applicable.
- Form validation errors: `<FormMessage>` inline under each field.
- Empty data: render a descriptive empty state (icon + message + optional CTA), not just "No data".

### Toast Notifications (Sonner)
- Success: confirm a completed action ("Expense saved").
- Error: surface a failure with a short reason ("Failed to save — please try again").
- Never use toasts for validation errors — those belong inline with the form field.
- Keep toast messages under 60 characters.

---

## 12. Icons

- Use `lucide-react` exclusively. Do not introduce other icon libraries.
- Icon size conventions: `h-4 w-4` for inline/button icons, `h-5 w-5` for standalone, `h-6 w-6` for navigation.
- Icons inside labeled buttons: `<Icon className="mr-2 h-4 w-4" aria-hidden="true" />`.
- All decorative icons: `aria-hidden="true"`.
- All meaningful standalone icons (no adjacent label): `aria-label` on the parent interactive element.

---

## 13. Animations

- Use only Tailwind's built-in animation utilities (`animate-spin`, `animate-pulse`, `animate-bounce`) or keyframes defined in `globals.css`.
- Radix primitives handle enter/exit animations via `data-state` — extend with `data-[state=open]:` variants, do not override with custom JS.
- Respect `prefers-reduced-motion`: use `motion-safe:` prefix or `motion-reduce:` override for all custom animations.
- Animate only transitions that aid user orientation (modal open, slide-in sheet, spinner feedback). No decorative-only animations.

---

## 14. Custom Component Requirements

When a custom component is necessary, it must:

1. Accept and forward `className` as a prop for external styling.
2. Accept a `ref` using `React.forwardRef` if it wraps a DOM element.
3. Use `cn()` from `@/lib/utils` for class merging — never string concatenation.
4. Include all required ARIA attributes.
5. Support dark mode through CSS variable tokens only.
6. Be placed in `components/` (page-level) or `components/ui/` (reusable primitive).
7. Follow the `data-slot="component-name"` convention for testability.

```tsx
// Custom component template
import * as React from "react"
import { cn } from "@/lib/utils"

interface MetricBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  label: string
}

const MetricBadge = React.forwardRef<HTMLSpanElement, MetricBadgeProps>(
  ({ value, label, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="metric-badge"
        aria-label={`${label}: ${value}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium",
          className
        )}
        {...props}
      >
        <span aria-hidden="true">{value}</span>
        <span className="text-muted-foreground">{label}</span>
      </span>
    )
  }
)
MetricBadge.displayName = "MetricBadge"

export { MetricBadge }
```

---

## 15. Do Not

- Do not use inline styles (`style={{}}`). All styling through Tailwind classes or CSS variables.
- Do not use arbitrary Tailwind values (`w-[347px]`) unless required by a fixed-dimension constraint.
- Do not use `z-index` utilities above `z-50` without a comment explaining why.
- Do not suppress TypeScript errors with `@ts-ignore` or `as any` in component files.
- Do not render interactive content inside `<Tooltip>` — tooltips are non-interactive overlays.
- Do not use `alert()`, `confirm()`, or `prompt()` — use `<AlertDialog>` and `<Dialog>` instead.
- Do not place business logic inside components — keep components presentational; logic in hooks or server actions.
- Do not hardcode user-facing strings with emojis unless explicitly required by the design.
