import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="container-app py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          <span className="text-brand-600">Stellex</span> <span className="text-gray-500">Testnet</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-brand-600">Orders</Link>
          <Link href="/create" className="btn btn-primary">Create</Link>
        </div>
      </nav>
    </div>
  );
}


