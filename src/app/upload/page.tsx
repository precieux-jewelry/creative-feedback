import Header from '@/components/layout/Header'
import UploadForm from './UploadForm'

export default function UploadPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Upload Video" />
      <main className="flex-1">
        <UploadForm />
      </main>
    </div>
  )
}
