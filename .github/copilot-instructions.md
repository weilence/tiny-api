# API Documentation Platform - Copilot Instructions

This is a **Nuxt 4 SPA** API documentation platform with a **full-stack TypeScript** architecture using **Prisma + PostgreSQL** and **Redis** for session management.

## Architecture Overview

- **Frontend**: Nuxt 4 SPA (`ssr: false`) with Nuxt UI components and TailwindCSS
- **Backend**: Nuxt server API routes with authentication middleware
- **Database**: PostgreSQL with Prisma ORM for hierarchical API documentation structure
- **Session Management**: Redis-based token authentication with auto-logout on 401
- **State Management**: Vue 3 Composition API with global auth composable

## Key Patterns & Conventions

### Authentication Flow

- **Token-based auth**: Server issues UUID tokens stored in Redis with TTL
- **Auto-redirect**: `api.ts` plugin intercepts 401 responses and redirects to `/auth/login`
- **Persistent sessions**: Tokens stored in localStorage, restored on app init
- **Protected routes**: Server middleware validates all `/api/*` except excluded paths

```typescript
// Auth header format (server expects "Token", not "Bearer")
headers: {
  Authorization: `Token ${token}`;
}
```

### API Client Pattern

Use the typed `http` utility instead of direct `$fetch`:

```typescript
// ✅ Correct - auto-auth, typed, error handling
const data = await http.get('/user');
const result = await http.post('/project', { name, groupId });

// ❌ Avoid - manual auth, no error handling
const data = await $fetch('/api/user');
```

### Component Patterns

- **Page components**: Place in `components/` folder at same level as the page file
- **Modal components**: Prefix with `Modal` (e.g., `ModalGroupDetail.vue`, `ModalProjectDetail.vue`)
- **Programmatic modals**: Use `useOverlay()` to create and open modals programmatically
- **Form validation**: Use Valibot schemas with Nuxt UI forms
- **Reactive forms**: Use `reactive()` for form state, not individual `ref()`s

```vue
<!-- Programmatic modal usage (see app/pages/group/index.vue) -->
<script setup>
import ModalGroupDetail from './components/ModalGroupDetail.vue';

const overlay = useOverlay();
const modalGroupDetail = overlay.create(ModalGroupDetail);

const createGroup = async () => {
  const instance = modalGroupDetail.open();
  if (await instance.result) {
    await loadGroups(); // Refresh data if modal returns true
  }
};

const editGroup = async (group: GroupQueryRes) => {
  const instance = modalGroupDetail.open({
    mode: 'edit',
    groupData: group,
  });
  if (await instance.result) {
    await loadGroups();
  }
};
</script>
```

```vue
<!-- Modal component internal structure -->
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

interface Props {
  mode?: 'create' | 'edit';
  groupData?: GroupQueryRes;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  groupData: undefined,
});

// Valibot schema for form validation
const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  description: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

// Reactive form state
const state = reactive<Schema>({
  name: props.groupData?.name || '',
  description: props.groupData?.description || '',
});

const emit = defineEmits<{ close: [boolean] }>();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (props.mode === 'edit' && props.groupData) {
    await http.put(`/group/${props.groupData.id}`, event.data);
  } else {
    await http.post('/group', event.data);
  }
  
  emit('close', true); // true = refresh parent data
};
</script>

<template>
  <UModal :title="title">
    <template #body>
      <UForm id="form-id" :schema="schema" :state="state" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Enter name" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UInput v-model="state.description" placeholder="Enter description" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="button-group">
        <UButton type="submit" form="form-id" color="primary">
          {{ mode === 'edit' ? 'Update' : 'Create' }}
        </UButton>
        <UButton color="secondary" @click="$emit('close', false)">
          Cancel
        </UButton>
      </div>
    </template>
  </UModal>
</template>
```

### Data Structure (Prisma Models)

Hierarchical API documentation structure:

```
Group → Project → EndpointGroup → Endpoint
       ↳ (1:n)   ↳ (1:n, tree)  ↳ (1:n)
```

- **Groups**: Top-level organization
- **Projects**: API projects within groups
- **EndpointGroups**: Hierarchical folders (self-referencing with `parentId`)
- **Endpoints**: API endpoints with OpenAPI-style parameter definitions

### Server API Conventions

- **File structure**: `/server/api/{resource}/{action}.{method}.ts`
- **Auth middleware**: Automatically applied to all `/api/*` routes except excluded paths
- **Error handling**: Use `createError()` with Chinese error messages
- **Session access**: `event.context.auth.user` contains authenticated user ID

```typescript
// Standard API route pattern
export default defineEventHandler(async (event) => {
  const body = await readBody<TypedRequest>(event);
  const userId = event.context.auth.user; // From auth middleware

  // Prisma operations...
  return result as TypedResponse;
});
```

## Development Workflow

### Essential Commands

```bash
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Production build
npx prisma studio     # Database GUI
npx prisma migrate dev # Apply schema changes
```

### Environment Setup

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`: Redis server host for sessions

### Database Operations

- **Schema changes**: Modify `prisma/schema.prisma` then run `prisma migrate dev`
- **Type generation**: Prisma Client auto-generates types in `.prisma/`
- **JSON fields**: Use `/// [TypeName]` comments for JSON type generation

## Project-Specific Notes

- **No SSR**: This is a client-side application (`ssr: false`)
- **Chinese UI**: All user-facing text is in Chinese
- **Monorepo structure**: Uses pnpm workspaces (see `pnpm-workspace.yaml`)
- **Type safety**: Shared types in `/shared/types/` used by both client and server
- **Redis integration**: Sessions, not caching - handles user authentication state

## File Organization

- `/app/`: Nuxt application code (pages, components, composables)
- `/server/`: Backend API routes and middleware
- `/shared/types/`: TypeScript definitions shared between client/server
- `/prisma/`: Database schema and migrations
- `nuxt.config.ts`: Disables SSR, configures modules and Redis storage
