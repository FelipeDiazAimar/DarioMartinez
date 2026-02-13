import { redirect } from 'next/navigation';

export default function AdminTestRedirectPage() {
  redirect('/admin/articulos');
}
