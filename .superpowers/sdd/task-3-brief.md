# T03: UI Component Library (shadcn/ui)

**Goal:** Install and configure shadcn/ui components needed for V1.

**Files to create:**
```
french-exam-trainer/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── dialog.tsx
│   │       ├── skeleton.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── separator.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── tooltip.tsx
│   │       └── progress.tsx
│   └── lib/
│       └── utils.ts        # cn() utility
```

**`src/lib/utils.ts`:**
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

**Components:** Follow simplefeedback pattern — cva + forwardRef + Radix primitives. Install via shadcn CLI or copy from simplefeedback.

**Tests:** None.

**Acceptance criteria:**
- All components render without errors
- `cn()` utility works
- Button variants (default, destructive, outline, secondary, ghost, link) work
- Card, Input, Select, Dialog all functional

**Dependencies:** T01.
