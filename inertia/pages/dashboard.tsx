import Page from '~/components/page'
import { Link } from '@adonisjs/inertia/react'
import { Plus } from 'lucide-react'
import AppLayout from '~/layouts/app'

export default function Dashboard() {
  return (
    <Page title="My shelf">
      <div className="empty">
        <h1>Your shelf is empty</h1>
        <p>Start by adding your first kit.</p>
        <Link route="kits.new" className="btn btn--primary btn--sm">
          <Plus size={14} /> Add kit
        </Link>
      </div>
    </Page>
  )
}

Dashboard.layout = [AppLayout]
