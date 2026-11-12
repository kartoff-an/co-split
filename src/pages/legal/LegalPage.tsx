import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ArrowLeftIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';

interface LegalPageProps {
  title: string;
  content: string;
}

export function LegalPage({ title, content }: LegalPageProps) {
  const navigate = useNavigate();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground mb-8 -ml-3 gap-2"
        >
          <ArrowLeftIcon size={18} weight="bold" />
          Back
        </Button>

        <article>
          <header className="border-border mb-10 border-b pb-8">
            <p className="text-primary mb-3 text-sm font-medium">Co-Split</p>

            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>

            <p className="text-muted-foreground mt-3 text-sm">Last updated November 12, 2026</p>
          </header>

          <div className="text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li::marker]:text-muted-foreground [&_a]:text-primary [&_hr]:border-border [&_blockquote]:border-border [&_th]:border-border [&_th]:bg-muted [&_th]:text-foreground [&_td]:border-border text-sm leading-7 sm:text-base [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:opacity-80 [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mt-10 [&_h1]:mb-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-8 [&_li]:mb-2 [&_li]:pl-1 [&_ol]:mb-5 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_strong]:font-semibold [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-3 [&_th]:border [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_ul]:mb-5 [&_ul]:ml-6 [&_ul]:list-disc">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          <footer className="border-border mt-12 border-t pt-6">
            <p className="text-muted-foreground text-sm">Co-Split — Shared expenses, made simple.</p>
          </footer>
        </article>
      </div>
    </main>
  );
}
