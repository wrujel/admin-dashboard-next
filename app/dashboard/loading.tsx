import Loader from '@/app/ui/dashboard/loader/loader';

// This file is used by Next.js to show a loading UI while the dashboard route
// (and its child routes like /dashboard/users or /dashboard/products) are
// being rendered during client-side navigation.
export default function Loading() {
  return <Loader />;
}
