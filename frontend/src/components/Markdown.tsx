import { useRef, useState, type ComponentProps } from 'react'
import ReactMarkdown, { type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

function languageOf(node: ExtraProps['node']) {
  const code = node?.children.find((c) => c.type === 'element' && c.tagName === 'code')
  if (!code || code.type !== 'element') return 'text'
  const cls: unknown = code.properties.className
  const list: string[] = Array.isArray(cls) ? cls.map(String) : typeof cls === 'string' ? cls.split(' ') : []
  return list.find((c) => c.startsWith('language-'))?.slice('language-'.length) ?? 'text'
}

function Pre({ node, children, ...rest }: ComponentProps<'pre'> & ExtraProps) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = ref.current?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock-top">
        <span>{languageOf(node)}</span>
        <button type="button" onClick={copy}>
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre ref={ref} {...rest}>
        {children}
      </pre>
    </div>
  )
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ pre: Pre }}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
