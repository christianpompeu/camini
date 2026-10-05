import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { RadarCallout } from "./radar-callout";

export interface RadarContentRendererProps {
  markdown: string;
}

interface ContentChunk {
  type: "markdown" | "callout";
  color?: string;
  icon?: string;
  content: string;
}

/**
 * Remove artefatos de administração, auditoria e migração
 * que não devem ser expostos na leitura pública da edição.
 */
function cleanAdminArtifacts(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // 1. Remove seções de auditoria do tipo "### JSON original" ou "### Fonte preservada" até o fim ou próximo cabeçalho
  cleaned = cleaned.replace(
    /\n?---?\s*\n+###\s*(?:JSON original|Fonte preservada)[\s\S]*?(?=(?:\n### |\n## |\n# |$))/gi,
    ""
  );
  cleaned = cleaned.replace(
    /###\s*(?:JSON original|Fonte preservada)[\s\S]*?(?=(?:\n### |\n## |\n# |$))/gi,
    ""
  );

  // 2. Remove tags residuais de arquivos <file ...>
  cleaned = cleaned.replace(/<file[\s\S]*?<\/file>/gi, "");
  cleaned = cleaned.replace(/<file[^>]*>/gi, "");

  // 3. Remove múltiplos separadores redundantes no fim
  cleaned = cleaned.trim().replace(/(?:---|\*\*\*)\s*$/, "").trim();

  return cleaned;
}

/**
 * Divide o Markdown em blocos normais e blocos de callout (<callout ...>...</callout>)
 */
function parseChunks(rawMarkdown: string): ContentChunk[] {
  const cleaned = cleanAdminArtifacts(rawMarkdown);
  const regex = /<callout(?:\s+icon="([^"]*)")?(?:\s+color="([^"]*)")?[^>]*>([\s\S]*?)<\/callout>/gi;

  const chunks: ContentChunk[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleaned)) !== null) {
    const textBefore = cleaned.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      chunks.push({ type: "markdown", content: textBefore });
    }

    chunks.push({
      type: "callout",
      icon: match[1] || "",
      color: match[2] || "",
      content: match[3]?.trim() || "",
    });

    lastIndex = regex.lastIndex;
  }

  const remaining = cleaned.slice(lastIndex);
  if (remaining.trim()) {
    chunks.push({ type: "markdown", content: remaining });
  }

  return chunks;
}

/**
 * Componentes customizados para o ReactMarkdown alinhados ao Studio Admin / Camini
 */
const markdownComponents: Components = {
  h2({ children }) {
    return (
      <h2 className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground mt-12 mb-4 pt-6 border-t border-border/60 first:border-t-0 first:pt-0 first:mt-6">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-foreground mt-8 mb-3">
        {children}
      </h3>
    );
  },
  p({ children }) {
    return (
      <p className="leading-relaxed text-foreground/90 my-4 text-base sm:text-[17px]">
        {children}
      </p>
    );
  },
  a({ href, children }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary font-medium transition-colors inline-flex items-center gap-1 break-all sm:break-normal"
      >
        <span>{children}</span>
        {isExternal && (
          <ExternalLink className="h-3 w-3 inline shrink-0 opacity-70" />
        )}
      </a>
    );
  },
  ul({ children }) {
    return (
      <ul className="my-4 pl-5 list-disc space-y-2 text-foreground/90 text-base sm:text-[17px] leading-relaxed">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="my-4 pl-5 list-decimal space-y-2 text-foreground/90 text-base sm:text-[17px] leading-relaxed">
        {children}
      </ol>
    );
  },
  li({ children, className }) {
    const isTaskList = className?.includes("task-list-item");
    if (isTaskList) {
      return (
        <li className="list-none -ml-5 flex items-start gap-2.5 my-2 text-foreground/90 text-base leading-relaxed">
          {children}
        </li>
      );
    }
    return <li className="my-1">{children}</li>;
  },
  input({ type, checked }) {
    if (type === "checkbox") {
      return checked ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
      );
    }
    return null;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-6 border-l-2 border-primary/50 pl-4 py-1 italic text-muted-foreground bg-muted/20 rounded-r-md">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="my-8 border-border/60" />;
  },
  table({ children }) {
    return (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-border shadow-xs">
        <table className="w-full caption-bottom text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-muted/50 border-b border-border">{children}</thead>;
  },
  tr({ children }) {
    return <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">{children}</tr>;
  },
  th({ children }) {
    return <th className="h-10 px-4 text-left align-middle font-semibold text-foreground">{children}</th>;
  },
  td({ children }) {
    return <td className="p-4 align-middle text-foreground/90">{children}</td>;
  },
  code({ className, children }) {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-5 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 font-mono text-xs sm:text-sm text-foreground">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm text-foreground border border-border/50">
        {children}
      </code>
    );
  },
};

export function RadarContentRenderer({ markdown }: RadarContentRendererProps) {
  const chunks = parseChunks(markdown);

  if (chunks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum conteúdo editorial disponível para exibição nesta edição.
      </div>
    );
  }

  return (
    <article className="radar-article font-sans">
      {chunks.map((chunk, index) => {
        if (chunk.type === "callout") {
          return (
            <RadarCallout
              key={`callout-${index}`}
              color={chunk.color}
              icon={chunk.icon}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {chunk.content}
              </ReactMarkdown>
            </RadarCallout>
          );
        }

        return (
          <ReactMarkdown
            key={`md-${index}`}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {chunk.content}
          </ReactMarkdown>
        );
      })}
    </article>
  );
}
