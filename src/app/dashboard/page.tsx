import { auth, currentUser } from '@clerk/nextjs/server'
import { checkProPlan } from '@/lib/subscription'

export default async function Dashboard() {
  const isProUser = await checkProPlan();

  if (!isProUser) return <h1 className='text-center'>You need to have a pro plan to get an access</h1>

  const user = await currentUser()

  return <div>Welcome, {user.firstName}!</div>
}