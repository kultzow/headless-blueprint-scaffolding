'use client'
import { jwtDecode } from 'jwt-decode'
import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function getSessionSnapshot(): string | null {
  const token = localStorage.getItem('wc_session');
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ data: { customer_id: string } }>(token);
    console.log(JSON.stringify(decoded));
    return decoded.data.customer_id;
  } catch {
    return null;
  }
}

export function MyCheckoutButton() {
  const session = useSyncExternalStore(
    () => () => {},       // no subscription needed
    getSessionSnapshot,   // client snapshot
    () => null            // server snapshot — always null, matches initial client render
  );

  if (!session) return <Button disabled>Checkout Unavailable</Button>;

  return ( 
  <Button asChild>
    <Link  target="_blank" href={`${process.env.BACKEND_WORDPRESS_URL}/checkout/?session_id=${session}`}>
     {`Checkout ${session}`}
    </Link>
    </Button>
  );
}
