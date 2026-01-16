# SaaS Starter Kit

A modern SaaS starter template built with **Next.js 16**, **Clerk** for authentication, and **Supabase** for database operations. This starter includes authentication, subscription management, and a dashboard with CRUD functionality.

## 🚀 Features

- **Next.js 16** with App Router and React 19
- **Clerk Authentication** - Complete sign-in/sign-up flow with middleware protection
- **Clerk Pricing Table** - Built-in subscription management
- **Supabase Integration** - Server-side database operations with Clerk JWT integration
- **Tailwind CSS v4** - Modern styling with PostCSS
- **TypeScript** - Full type safety
- **Server Actions** - Type-safe server-side operations
- **React Compiler** - Enabled for optimized React rendering

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- A **Clerk** account ([Sign up](https://clerk.com))
- A **Supabase** account ([Sign up](https://supabase.com))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd saas-starter-kit
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Required for dashboard functionality)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Never commit `.env.local` to version control. It's already included in `.gitignore`.

### 4. Get your Clerk keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or select an existing one
3. Navigate to **API Keys** in the sidebar
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 5. Get your Supabase keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy your **Project URL** (under "Project URL")
5. Copy your **anon/public key** (under "Project API keys" → "anon public") - this is your `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## 🏃 Running the Application

Start the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically:
- Handle authentication via Clerk
- Protect routes using the middleware in `src/proxy.ts`
- Enable server-side rendering with React Server Components

## 📁 Project Structure

```
saas-starter-kit/
├── src/
│   ├── proxy.ts                    # Next.js middleware (Clerk authentication)
│   ├── app/
│   │   ├── (auth)/                 # Authentication route group
│   │   │   ├── sign-in/            # Sign in page
│   │   │   └── sign-up/            # Sign up page
│   │   ├── (marketing)/            # Public marketing pages
│   │   │   ├── _components/        # Marketing components
│   │   │   └── page.tsx            # Home page
│   │   ├── dashboard/              # Protected dashboard
│   │   │   └── _components/        # Dashboard components
│   │   ├── pricing/                # Pricing page
│   │   ├── layout.tsx              # Root layout with ClerkProvider
│   │   └── globals.css             # Global styles
│   ├── components/                 # Shared components
│   │   └── Navbar.tsx              # Navigation bar
│   └── lib/
│       ├── supabase.ts            # Supabase client setup
│       ├── subscription.ts         # Subscription logic
│       └── actions/                # Server actions
│           └── supabasetest.actions.ts
├── public/                         # Static assets
├── next.config.ts                  # Next.js configuration
├── package.json
└── tsconfig.json
```

## 🗄️ Supabase Database Setup

To enable the dashboard functionality, you need to set up the database table in Supabase.

### 1. Create the Table

Go to your Supabase project → **SQL Editor** and run:

```sql
CREATE TABLE record_test (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_record_test_user_id ON record_test(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_record_test_updated_at
BEFORE UPDATE ON record_test
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE record_test ENABLE ROW LEVEL SECURITY;
```

### 2. Enable Row Level Security (Recommended)

For better security, enable RLS and create policies:

```sql
create policy "own rows: select"
on public.record_test
for select
to authenticated
using (auth.jwt() ->> 'sub' = user_id);

create policy "own rows: insert"
on public.record_test
for insert
to authenticated
with check (auth.jwt() ->> 'sub' = user_id);

create policy "own rows: update"
on public.record_test
for update
to authenticated
using (auth.jwt() ->> 'sub' = user_id)
with check (auth.jwt() ->> 'sub' = user_id);

create policy "own rows: delete"
on public.record_test
for delete
to authenticated
using (auth.jwt() ->> 'sub' = user_id);
```

### 3. Configure Supabase for Clerk JWT Integration

This starter uses Clerk's JWT tokens with Supabase. To enable this integration:

1. **In Clerk Dashboard:**
   - Go to **Integrations** → **Supabase**
   - Follow the setup instructions to connect Clerk with Supabase
   - This allows Supabase to verify JWTs issued by Clerk

2. **In Supabase Dashboard:**
   - Go to **Authentication** → **Providers**
   - Configure third-party JWT authentication
   - Add Clerk as a provider using your Clerk domain

**Note:** The integration allows Supabase to trust JWTs from Clerk, enabling Row Level Security (RLS) policies to work with Clerk user IDs. The `user_id` field in your tables should match the `sub` claim from Clerk's JWT.

For detailed instructions, see:
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase Third-Party Auth Documentation](https://supabase.com/docs/guides/auth/third-party-auth)

## 💳 Clerk Subscription Setup

The dashboard is protected by a "pro plan" check. To enable this:

1. **Set up billing in Clerk:**
   - Go to **Clerk Dashboard** → **Billing**
   - Create your pricing plans (e.g., "Free" and "Pro")
   - Note the plan identifiers

2. **Update plan checks in code:**
   - Open `src/lib/subscription.ts`
   - Update the plan identifiers to match your Clerk plan metadata:

```typescript
// src/lib/subscription.ts
export async function getUserPlan(): Promise<PlanType | null> {
    const { has } = await auth()

    if (typeof has === 'function') {
        if (has({ plan: 'pro' })) return 'pro'  // Update with your actual plan ID
        if (has({ plan: 'free' })) return 'free' // Update with your actual plan ID
    }

    return null
}
```

3. **Assign plans to users:**
   - In Clerk Dashboard, you can assign plans to users via metadata
   - Or use Clerk's billing webhooks to automatically assign plans

For more information, see the [Clerk Billing documentation](https://clerk.com/docs/billing/overview).

## 📜 Available Scripts

- `npm run dev` - Start development server at [http://localhost:3000](http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server (run `build` first)
- `npm run lint` - Run ESLint to check for code issues

## 🐛 Troubleshooting

### Clerk Authentication Not Working

- **Check environment variables:** Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set correctly in `.env.local`
- **Verify Clerk application:** Check that your Clerk application is properly configured in the Clerk Dashboard
- **Check redirect URLs:** In Clerk Dashboard → **Paths**, ensure your local URL (`http://localhost:3000`) is added to allowed redirect URLs
- **Restart dev server:** After changing environment variables, restart your development server

### Supabase Connection Errors

- **Verify environment variables:** Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are correct
- **Check database table:** Ensure the `record_test` table exists (run the SQL from the setup section)
- **JWT integration:** Verify that Clerk-Supabase integration is properly configured (see Supabase setup section)
- **Check RLS policies:** If RLS is enabled, ensure policies allow the current user to access their data

### Dashboard Shows "You need to have a pro plan"

- **Set up billing plans:** Create pricing plans in Clerk Dashboard → **Billing**
- **Update plan identifiers:** Modify `src/lib/subscription.ts` to use your actual Clerk plan IDs
- **Assign plan to user:** In Clerk Dashboard, assign the appropriate plan to your test user via user metadata

### Middleware Not Running

- **Check file location:** Ensure `src/proxy.ts` exists and is in the correct location
- **Verify matcher config:** Check that the `matcher` in `proxy.ts` includes the routes you want to protect
- **Restart dev server:** Middleware changes require a server restart

### Environment Variables Not Available

- **Client-side variables:** Only variables prefixed with `NEXT_PUBLIC_` are available in client-side code
- **Server-side variables:** All variables (with or without `NEXT_PUBLIC_`) are available in server components and API routes
- **Restart required:** After adding or changing environment variables, restart your development server

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Clerk Documentation](https://clerk.com/docs) - Authentication and user management
- [Supabase Documentation](https://supabase.com/docs) - Database, auth, and real-time features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - Type-safe JavaScript

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy coding! 🚀**

