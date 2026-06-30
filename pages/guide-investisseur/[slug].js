import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import CommentForm from '../../components/CommentForm';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Injecte un id="" dans chaque <h2> du HTML et retourne (html modifié, liste des titres)
function injectHeadingIds(rawHtml) {
  const headings = [];
  const seen = {};
  const withIds = rawHtml.replace(/<h2>(.*?)<\/h2>/g, (match, inner) => {
    const text = inner.replace(/<[^>]+>/g, ''); // strip d'éventuelles balises internes (gras, etc.)
    let slug = slugify(text);
    if (seen[slug]) {
      seen[slug] += 1;
      slug = `${slug}-${seen[slug]}`;
    } else {
      seen[slug] = 1;
    }
    headings.push({ id: slug, text });
    return `<h2 id="${slug}">${inner}</h2>`;
  });
  return { html: withIds, headings };
}

function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav
      aria-label="Sommaire"
      style={{
        position: 'sticky',
        top: '32px',
        fontSize: '13px',
        lineHeight: 1.6,
      }}
    >
      <div className="ref-mono" style={{ fontSize: '11px', color: '#4A4E5A', letterSpacing: '0.1em', marginBottom: '14px' }}>
        SOMMAIRE
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '1px solid #1C1F27' }}>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              style={{
                display: 'block',
                padding: '7px 0 7px 14px',
                marginLeft: '-1px',
                borderLeft: activeId === h.id ? '2px solid #C9A84C' : '1px solid transparent',
                color: activeId === h.id ? '#F4F2EC' : '#7B7F8A',
                textDecoration: 'none',
                transition: 'color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ArticleAuto({ articleData }) {
  return (
    <>
      <Head>
        <title>{articleData.title} | Audit Immo</title>
        <meta name="description" content={articleData.description} />
      </Head>

      <div style={{ background: '#0B0D12', minHeight: '100vh', color: '#E7E5DF', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

          .display { font-family: 'Fraunces', Georgia, serif; }
          .ref-mono { font-family: 'JetBrains Mono', monospace; }

          .markdown-content { font-size: 17px; line-height: 1.75; color: #C7C9D1; }
          .markdown-content h2 {
            font-family: 'Fraunces', Georgia, serif;
            font-weight: 500;
            font-size: 27px;
            color: #F4F2EC;
            margin: 48px 0 18px;
            padding-bottom: 12px;
            border-bottom: 1px solid #1C1F27;
            scroll-margin-top: 32px;
          }
          .markdown-content h3 {
            font-family: 'Fraunces', Georgia, serif;
            font-weight: 500;
            font-size: 21px;
            color: #F4F2EC;
            margin: 36px 0 14px;
            scroll-margin-top: 32px;
          }
          .markdown-content p { margin: 0 0 20px; }
          .markdown-content a { color: #C9A84C; text-decoration: underline; text-underline-offset: 3px; }
          .markdown-content strong { color: #F4F2EC; font-weight: 600; }
          .markdown-content ul, .markdown-content ol { margin: 0 0 20px; padding-left: 22px; }
          .markdown-content li { margin-bottom: 8px; }
          .markdown-content blockquote {
            margin: 28px 0;
            padding: 4px 0 4px 20px;
            border-left: 2px solid #C9A84C;
            color: #9A9DA8;
            font-style: italic;
          }
          .markdown-content code {
            font-family: 'JetBrains Mono', monospace;
            background: #161922;
            border: 1px solid #232732;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 14px;
            color: #C9A84C;
          }
          .markdown-content table { width: 100%; border-collapse: collapse; margin: 28px 0; font-size: 15px; }
          .markdown-content th, .markdown-content td {
            border: 1px solid #232732;
            padding: 10px 14px;
            text-align: left;
          }
          .markdown-content th { background: #161922; color: #F4F2EC; font-weight: 600; }
          .markdown-content hr { border: none; border-top: 1px solid #1C1F27; margin: 40px 0; }

          .article-grid {
            display: grid;
            grid-template-columns: 1fr 200px;
            gap: 56px;
            align-items: start;
          }
          @media (max-width: 860px) {
            .article-grid { grid-template-columns: 1fr; }
            .toc-col { display: none; }
          }
        `}</style>

        <main style={{ maxWidth: '940px', margin: '0 auto', padding: '0 24px 96px' }}>
          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 0', borderBottom: '1px solid #1C1F27' }}>
            <a href="/guide-investisseur" style={{ color: '#8B8F99', fontSize: '13px', textDecoration: 'none' }}>
              ← Guide investisseur
            </a>
            <span className="ref-mono" style={{ fontSize: '11px', color: '#4A4E5A', letterSpacing: '0.1em' }}>J2F CONSEIL</span>
          </div>

          {/* Header */}
          <header style={{ padding: '56px 0 40px', maxWidth: '700px' }}>
            {articleData.category && (
              <div className="ref-mono" style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '18px' }}>
                {articleData.category}
              </div>
            )}
            <h1 className="display" style={{ fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 500, lineHeight: 1.2, color: '#F4F2EC', marginBottom: '18px' }}>
              {articleData.title}
            </h1>
            <p style={{ color: '#6B6F7A', fontSize: '13px' }}>
              Publié le {formatDate(articleData.date)}
            </p>
          </header>

          <div style={{ borderTop: '1px solid #1C1F27' }} />

          {/* Content + TOC */}
          <div className="article-grid" style={{ paddingTop: '8px' }}>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: articleData.contentHtml }}
            />
            <div className="toc-col">
              <TableOfContents headings={articleData.headings} />
            </div>
          </div>

          <footer style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #1C1F27' }}>
            <a href="/guide-investisseur" style={{ color: '#C9A84C', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
              ← Retour au guide investisseur
            </a>
          </footer>

          <div style={{ marginTop: '48px' }}>
            <CommentForm articleSlug={articleData.slug} />
          </div>
        </main>
      </div>
    </>
  );
}

// 1. Lister tous les fichiers .md pour que Next.js sache quelles URLs créer
export async function getStaticPaths() {
  const articlesDirectory = path.join(process.cwd(), 'articles');
  const filenames = fs.readdirSync(articlesDirectory);

  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(/\.md$/, '') },
  }));

  return { paths, fallback: false };
}

// 2. Extraire le texte du fichier .md, le transformer en HTML, et générer le sommaire à partir des h2
export async function getStaticProps({ params }) {
  const fullPath = path.join(process.cwd(), 'articles', `${params.slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);
  const processedContent = await remark().use(html).process(matterResult.content);
  const rawHtml = processedContent.toString();

  const { html: contentHtml, headings } = injectHeadingIds(rawHtml);

  return {
    props: {
      articleData: {
        slug: params.slug,
        contentHtml,
        headings,
        ...matterResult.data,
      },
    },
  };
}
