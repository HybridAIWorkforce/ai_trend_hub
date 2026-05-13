import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ArticleWizard } from '@/components/articles/article-wizard';
import { Loader2 } from 'lucide-react';

interface PageProps {
  searchParams: {
    trendItemId?: string;
  };
}

export default async function NewArticlePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  const { trendItemId } = searchParams;

  if (!trendItemId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">No Trend Item Selected</h1>
          <p className="text-zinc-400 mb-6">
            Please select a trend item from the dashboard to create an article.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const trendItem = await prisma.trendItem.findUnique({
    where: { id: trendItemId },
    include: {
      category: {
        select: {
          id: true,
          displayName: true
        }
      }
    }
  });

  if (!trendItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Trend Item Not Found</h1>
          <p className="text-zinc-400 mb-6">
            The trend item you selected could not be found.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Create Article</h1>
        <p className="text-zinc-400">
          Transform your trend item into a compelling article with AI-powered assistance
        </p>
      </div>
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ArticleWizard trendItem={trendItem} />
      </Suspense>
    </div>
  );
}