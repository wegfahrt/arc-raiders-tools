# Database Schema Migration Guide

## Overview
This guide explains the database schema changes made to support multi-language translations for the Arc Raiders Tools application.

## Changes Made

### 1. Schema Updates (`src/server/db/schema.ts`)
The following columns were changed from `text()` to `jsonb()` to support multi-language translations:

- **items table**:
  - `name`: `text()` → `jsonb()`
  - `description`: `text()` → `jsonb()`

- **skill_nodes table**:
  - `name`: `text()` → `jsonb()`
  - `description`: `text()` → `jsonb()`

- **hideout_modules table**:
  - `name`: `text()` → `jsonb()`

- **material_usage view**:
  - `name`: `text()` → `jsonb()`

### 2. TypeScript Types (`src/lib/types.ts`)
Added `TranslatedText` interface to support multi-language content:

```typescript
export interface TranslatedText {
  en: string;
  de?: string;
  fr?: string;
  es?: string;
  pt?: string;
  pl?: string;
  no?: string;
  da?: string;
  it?: string;
  ru?: string;
  ja?: string;
  "zh-TW"?: string;
  uk?: string;
  "zh-CN"?: string;
  kr?: string;
  tr?: string;
  hr?: string;
  sr?: string;
}
```

Updated interfaces to use `string | TranslatedText` for:
- `Item.name` and `Item.description`
- `Skill.name` and `Skill.description`
- `Workstation.name`

### 3. Utility Functions (`src/lib/utils.ts`)
Added `getLocalizedText()` helper function to safely extract translated text:

```typescript
export function getLocalizedText(
  translatedText: string | TranslatedText | any,
  locale: string = 'en'
): string
```

This function:
- Handles both string and TranslatedText formats (backwards compatible)
- Falls back to English if the requested locale is not available
- Returns empty string for null/undefined values

### 4. Query Updates
Added imports for `getLocalizedText` in:
- `src/server/db/queries/items.ts`
- `src/server/db/queries/workstations.ts`

## Generated Migration

The migration file was automatically generated at:
**`supabase/migrations/0001_oval_prima.sql`**

### What the Migration Does:
1. Alters column types from `text` to `jsonb` for the translated fields
2. Recreates indexes and constraints that were affected
3. Updates the `material_usage` view to reflect the new schema

## How to Apply the Migration

### Option 1: Using Drizzle (Recommended for Development)

**Prerequisites:**
- Ensure `DATABASE_URL` is set in your `.env` file
- Make sure you're connected to the correct database

**Steps:**
```powershell
# Apply the migration to your database
pnpm db:migrate
```

This will:
- Connect to your Supabase database
- Run the SQL migration file
- Update your database schema

### Option 2: Manual Application via Supabase Dashboard

**Steps:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/0001_oval_prima.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 3: Using Drizzle Push (Development Only)

⚠️ **Warning**: This bypasses migrations and directly pushes schema changes. Only use in development!

```powershell
pnpm db:push
```

## Data Format

### Before Migration (Text):
```json
{
  "name": "Adrenaline Shot"
}
```

### After Migration (JSONB):
```json
{
  "name": {
    "en": "Adrenaline Shot",
    "de": "Adrenalin-Spritze",
    "fr": "Injection d'adrénaline",
    "es": "Inyección de adrenalina",
    "pt": "Injeção de adrenalina",
    "pl": "Zastrzyk adrenaliny",
    "no": "Adrenalin-sprøyte",
    "da": "Adrenalin-indsprøjtning",
    "it": "Iniezione di adrenalina",
    "ru": "Инъекция адреналина",
    "ja": "アドレナリン注射",
    "zh-TW": "腎上腺素注射劑",
    "uk": "Ін'єкція адреналіну",
    "zh-CN": "肾上腺素注射剂",
    "kr": "아드레날린 주사",
    "tr": "Adrenalin İğnesi",
    "hr": "Injekcija adrenalina",
    "sr": "Injekcija adrenalina"
  }
}
```

## Using Translations in Your Code

### In Server Components/Queries:
```typescript
import { getLocalizedText } from '~/lib/utils';

// Example usage
const items = await getAllItems();
const itemName = getLocalizedText(items[0].name, 'de'); // German translation
const itemNameEn = getLocalizedText(items[0].name); // Defaults to English
```

### In Client Components:
```typescript
'use client';

import { getLocalizedText } from '~/lib/utils';
import { useState } from 'react';

export default function ItemList({ items }) {
  const [locale, setLocale] = useState('en');
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{getLocalizedText(item.name, locale)}</h3>
          <p>{getLocalizedText(item.description, locale)}</p>
        </div>
      ))}
    </div>
  );
}
```

## Verification

After applying the migration, verify the changes:

### 1. Check Schema in Supabase:
```sql
-- Check items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' 
AND column_name IN ('name', 'description');

-- Should show: jsonb for both columns
```

### 2. Test Data:
```sql
-- Test querying translated data
SELECT name->>'en' as english_name, 
       name->>'de' as german_name 
FROM items 
LIMIT 5;
```

### 3. Run TypeScript Type Check:
```powershell
pnpm typecheck
```

## Rollback Plan

If you need to rollback this migration:

1. **Backup your data first!**
2. Create a reverse migration that converts `jsonb` back to `text`
3. You'll need to handle data transformation if translations were added

Example rollback SQL (⚠️ will lose translations):
```sql
ALTER TABLE items 
  ALTER COLUMN name TYPE text USING name->>'en',
  ALTER COLUMN description TYPE text USING description->>'en';

ALTER TABLE skill_nodes 
  ALTER COLUMN name TYPE text USING name->>'en',
  ALTER COLUMN description TYPE text USING description->>'en';

ALTER TABLE hideout_modules 
  ALTER COLUMN name TYPE text USING name->>'en';
```

## Next Steps

1. **Apply the migration** using one of the methods above
2. **Update your data sync workflow** (`.github/workflows/sync-supabase.yml`) if needed
3. **Add language selector UI** to allow users to switch languages
4. **Update existing components** to use `getLocalizedText()` helper
5. **Test thoroughly** in development before deploying to production

## Questions?

If you encounter any issues:
1. Check the migration file for SQL errors
2. Verify your database connection string
3. Ensure your Supabase database user has the necessary permissions
4. Review the Drizzle Kit documentation: https://orm.drizzle.team/kit-docs/overview

## Files Modified

- ✅ `src/server/db/schema.ts` - Updated table definitions
- ✅ `src/lib/types.ts` - Added TranslatedText interface and updated interfaces
- ✅ `src/lib/utils.ts` - Added getLocalizedText helper
- ✅ `src/server/db/queries/items.ts` - Added helper import
- ✅ `src/server/db/queries/workstations.ts` - Added helper import
- ✅ `supabase/migrations/0001_oval_prima.sql` - Generated migration file

## Migration Status

- [ ] Migration generated
- [ ] Migration reviewed
- [ ] Migration applied to development database
- [ ] Migration tested
- [ ] Migration applied to production database
