import { auth, currentUser } from '@clerk/nextjs/server'
import { checkProPlan } from '@/lib/subscription'

export default async function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <h1 className='text-5xl'>Landing Page</h1>
    </div>

  )
}