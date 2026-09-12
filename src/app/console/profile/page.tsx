import { redirect } from 'next/navigation';
import { getSessionIdentity } from '@/lib/auth/session-identity';

export default async function ConsoleProfileRedirectPage() {
  const session = await getSessionIdentity();
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role?.toUpperCase();
  if (role === 'PROVIDER') {
    redirect('/console/provider/profile');
  } else if (role === 'ADMIN') {
    redirect('/console/admin');
  }

  redirect('/console/customer/profile');
}
