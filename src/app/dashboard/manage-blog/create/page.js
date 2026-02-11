import React from 'react'
import PageTitle from '@/components/home-component/PageTitle'
import AddBlogPage from '@/app/dashboard/add-blog/page'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const metadata = {
  title: 'Create Blog Post | UNIZIK Hostel',
  description: 'Create and publish new blog posts to share updates and insights with your audience.',
}

export default function CreateBlogPage() {
	return (
		<ProtectedRoute allowedRoles={['super admin', 'admin', 'staff']}>
		<div className="container mx-auto px-6 lg:px-20 py-12">
			<PageTitle title="Create Blog Post" subtitle="Add a new blog post to your website" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Manage Blog', href: '/dashboard/manage-blog' }, { label: 'Create Post' }]} />
			<div className="mt-6">
				<AddBlogPage />
			</div>
		</div>
		</ProtectedRoute>
	)
}
