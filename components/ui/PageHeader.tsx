import Link from 'next/link'

interface Props {
  title: string
  description?: string
  action?: { href: string; label: string }
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
