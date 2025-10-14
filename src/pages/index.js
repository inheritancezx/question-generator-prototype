import QuestionGenerator from '@/components/QuestionGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          AI Question Generator
        </h1>
        <QuestionGenerator />
      </div>
    </main>
  )
}