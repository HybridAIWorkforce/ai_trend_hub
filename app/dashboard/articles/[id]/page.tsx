import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ArticleEditor } from '@/components/articles/article-editor';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      sourceTrendItem: {
        select: {
          id: true,
          title: true,
          summary: true,
          sourceName: true
        }
      },
      versions: {
        select: {
          versionNumber: true,
          createdAt: true
        },
        orderBy: {
          versionNumber: 'desc'
        }
      }
    }
  });

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Article Not Found</h1>
          <p className="text-zinc-400 mb-6">
            The article you're looking for could not be found.
          </p>
          <a
            href="/dashboard/articles"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View All Articles
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleEditor article={article} />
    </div>
  );
}