import { getSession } from '@/lib/auth';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function requireSystemAdmin() {
  const session = await getSession();
  if (!session) return null;
  
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .then(res => res[0]);
  
  if (userData?.systemRole !== 'system_admin') return null;
  return session;
}