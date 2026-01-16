import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const { isAuthenticated } = await auth()
  const { has } = await auth()

  const hasProPlan = has({plan:"pro_plan"})

  if (!hasProPlan) return <h1>you don't have a pro plan</h1>

  if (!isAuthenticated) {
    return <div>Sign in to view this page</div>
  }

  const user = await currentUser()

  return <div>Welcome, {user.firstName}!</div>
}