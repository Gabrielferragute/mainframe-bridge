import { useState, useMemo } from 'react'
import './App.css'

const SAMPLE_COBOL = `       01  TRANSACAO-FINANCEIRA.
           05  TRX-CABECALHO.
               10  TRX-ID                  PIC 9(12).
               10  TRX-DATA-HORA.
                   15  TRX-DATA            PIC 9(08).
                   15  TRX-HORA            PIC 9(06).
               10  TRX-TIPO                PIC X(02).
                   88  TRX-DEPOSITO        VALUE 'DP'.
                   88  TRX-SAQUE           VALUE 'SQ'.
                   88  TRX-TRANSF          VALUE 'TR'.
               10  TRX-STATUS              PIC X(01).
                   88  STATUS-PENDENTE     VALUE 'P'.
                   88  STATUS-EFETIVADO    VALUE 'E'.
           05  TRX-DETALHES.
               10  TRX-CONTA-ORIGEM        PIC 9(10).
               10  TRX-CONTA-DESTINO       PIC 9(10).
               10  TRX-VALOR               PIC S9(15)V99 COMP-3.
           05  TRX-DADOS-DOC.
               10  TRX-DOCUMENTO           PIC X(14).
               10  TRX-DOC-RED REDEFINES TRX-DOCUMENTO.
                   15  TRX-CPF             PIC 9(11).
                   15  FILLER              PIC X(03).
           05  TRX-HISTORICO               OCCURS 5 TIMES.
               10  HIST-CODIGO             PIC 9(04).
               10  HIST-DESCRICAO          PIC X(40).`

const TABS = [
  { key: 'typescript', label: 'TypeScript', icon: 'TS' },
  { key: 'json', label: 'JSON Schema', icon: 'JS' },
  { key: 'zod', label: 'Zod', icon: 'Z' },
  { key: 'semantic', label: 'Mapeamento', icon: '⇄' },
  { key: 'hierarchy', label: 'Hierarquia', icon: '🌳' },
  { key: 'docs', label: 'Docs', icon: '📄' },
]

/* ─── Componentes Auxiliares ─── */

function StatusPill({ label, color }) {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-400/15 text-amber-400 border-amber-400/25',
    indigo: 'bg-accent-500/15 text-accent-300 border-accent-500/25',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colors[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-emerald-400' : color === 'amber' ? 'bg-amber-400' : 'bg-accent-400'}`} />
      {label}
    </span>
  )
}

function LineNumbers({ count }) {
  return (
    <div className="select-none pr-4 text-right text-surface-600 text-xs leading-[1.65rem] font-mono border-r border-surface-800/80">
      {Array.from({ length: count }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-surface-400 bg-surface-800/50 hover:text-white hover:bg-surface-700/50 rounded-md transition-colors"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-emerald-400">Copiado!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar
        </>
      )}
    </button>
  )
}

/* ─── Modern Loading & Empty States ─── */

function ModernLoadingState() {
  return (
    <div className="relative h-full w-full overflow-hidden p-8 flex flex-col gap-6 animate-fade-in">
      {/* Linha de Scan que sobe e desce */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="w-full h-[150px] bg-gradient-to-b from-transparent via-accent-500/10 to-transparent animate-scan" />
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-800 shimmer-line" />
        <div className="space-y-2 flex-1">
          <div className="shimmer-line w-48 h-4 rounded-md" />
          <div className="shimmer-line w-32 h-3 rounded-md" />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {[100, 85, 92, 60, 88, 70, 95, 45, 80, 65, 90, 50].map((w, i) => (
          <div key={i} className="shimmer-line h-3 rounded-sm" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-surface-800/40">
        <div className="flex items-center justify-between mb-4">
          <div className="shimmer-line w-36 h-4 rounded-md" />
          <div className="shimmer-line w-20 h-4 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="shimmer-line h-12 rounded-lg" />
          <div className="shimmer-line h-12 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function ModernEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[450px] p-8 text-center animate-fade-in">
      <div className="relative mb-8">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-accent-500/20 blur-[60px] rounded-full animate-pulse" />
        
        {/* Ícone Composto */}
        <div className="relative w-24 h-24 rounded-3xl bg-surface-900 border border-surface-800 flex items-center justify-center shadow-2xl shadow-black">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-400">
            <path d="M4 17L10 11L4 5" />
            <path d="M12 19H20" />
            <circle cx="12" cy="12" r="10" strokeOpacity="0.1" />
          </svg>
          
          {/* Elementos Orbitais */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface-850 border border-surface-800 flex items-center justify-center animate-bounce [animation-duration:3s]">
            <span className="text-[10px] font-bold text-emerald-400">01</span>
          </div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-lg bg-surface-850 border border-surface-800 flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-surface-500 bg-clip-text text-transparent mb-3">
        Pronto para Modernizar
      </h3>
      <p className="text-sm text-surface-500 max-w-[280px] leading-relaxed mb-8">
        Insira seu código COBOL à esquerda e veja a mágica da transformação para o mundo moderno.
      </p>

      <div className="flex gap-4 py-4 px-6 rounded-2xl bg-surface-900/40 border border-surface-800/50 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-accent-400 font-bold">120+</span>
          <span className="text-[10px] text-surface-600 uppercase tracking-wider">Regras</span>
        </div>
        <div className="w-px h-8 bg-surface-800" />
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-emerald-400 font-bold">100%</span>
          <span className="text-[10px] text-surface-600 uppercase tracking-wider">Cloud</span>
        </div>
        <div className="w-px h-8 bg-surface-800" />
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-amber-400 font-bold">Zod</span>
          <span className="text-[10px] text-surface-600 uppercase tracking-wider">Types</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Melhoria #3: Tree View ─── */

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 3)
  const hasChildren = node.children && node.children.length > 0
  const indent = depth * 16

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 hover:bg-surface-800/40 rounded cursor-pointer transition-colors group"
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-surface-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          <span className="w-3 h-3 flex items-center justify-center text-surface-700">•</span>
        )}

        <span className={`text-xs font-mono ${node.level === 88 ? 'text-amber-400/80' : 'text-accent-300'}`}>
          {String(node.level).padStart(2, '0')}
        </span>

        <span className="text-xs font-mono text-surface-300 group-hover:text-white transition-colors">
          {node.name}
        </span>

        {node.pic && (
          <span className="text-xs font-mono text-surface-600 ml-auto">
            {node.pic}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="border-l border-surface-800/50" style={{ marginLeft: `${indent + 14}px` }}>
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Melhoria #2: Mapeamento Semântico (Tabela) ─── */

function SemanticMapTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-surface-500 text-sm p-4">Sem dados de mapeamento.</p>
  }
  return (
    <div className="overflow-auto p-2">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-surface-800/60">
            <th className="text-left py-2 px-3 text-surface-500 font-medium">COBOL</th>
            <th className="text-left py-2 px-3 text-surface-500 font-medium">Moderno</th>
            <th className="text-left py-2 px-3 text-surface-500 font-medium">Tipo</th>
            <th className="text-right py-2 px-3 text-surface-500 font-medium">Tam.</th>
            <th className="text-right py-2 px-3 text-surface-500 font-medium">Offset</th>
            <th className="text-left py-2 px-3 text-surface-500 font-medium">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
              <td className="py-2 px-3 text-amber-400/80">{row.cobolName}</td>
              <td className="py-2 px-3 text-accent-300">{row.modernName}</td>
              <td className="py-2 px-3">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                  ${row.type === 'number' ? 'bg-blue-500/15 text-blue-400' :
                    row.type === 'string' ? 'bg-emerald-500/15 text-emerald-400' :
                    row.type === 'array' ? 'bg-purple-500/15 text-purple-400' :
                    row.type === 'object' ? 'bg-orange-500/15 text-orange-400' :
                    'bg-surface-700/50 text-surface-400'}`}>
                  {row.type}
                </span>
              </td>
              <td className="py-2 px-3 text-right text-surface-400">{row.size ?? '—'}</td>
              <td className="py-2 px-3 text-right text-surface-400">{row.offset ?? '—'}</td>
              <td className="py-2 px-3 text-surface-400 max-w-[200px] truncate">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Syntax Highlighting (sem dependências externas) ─── */

function SyntaxHighlight({ code, language }) {
  if (!code) return null

  const highlightLine = (line) => {
    const tokens = []
    let remaining = line
    let key = 0

    // Patterns por prioridade
    const patterns = [
      // Comentários
      { regex: /(\/\/.*$)/, cls: 'text-surface-600 italic' },
      // Strings
      { regex: /('[^']*'|"[^"]*")/, cls: 'text-emerald-400' },
      // Keywords TS/Zod
      { regex: /\b(export|interface|type|const|import|from|extends|implements|function|return|async|await|new|class|enum|namespace|declare|readonly|as|typeof|keyof|infer)\b/, cls: 'text-purple-400 font-medium' },
      // Types
      { regex: /\b(string|number|boolean|null|undefined|void|never|any|unknown|Array|Record|Partial|Required|Pick|Omit|true|false)\b/, cls: 'text-cyan-400' },
      // Zod methods
      { regex: /\b(z\.object|z\.string|z\.number|z\.array|z\.boolean|z\.literal|z\.union|z\.enum|z\.optional|z\.nullable|z\.infer|z\.coerce)\b/, cls: 'text-amber-400' },
      // Numbers
      { regex: /(\b\d+\.?\d*\b)/, cls: 'text-orange-400' },
      // JSON keys
      { regex: /("[^"]+"\s*:)/, cls: 'text-accent-300' },
      // Punctuation
      { regex: /([{}\[\]();:,])/, cls: 'text-surface-500' },
    ]

    while (remaining.length > 0) {
      let earliest = null
      let earliestIdx = Infinity
      let earliestPattern = null

      for (const p of patterns) {
        const match = remaining.match(p.regex)
        if (match && match.index < earliestIdx) {
          earliest = match
          earliestIdx = match.index
          earliestPattern = p
        }
      }

      if (!earliest) {
        tokens.push(<span key={key++} className="text-surface-300">{remaining}</span>)
        break
      }

      if (earliestIdx > 0) {
        tokens.push(<span key={key++} className="text-surface-300">{remaining.slice(0, earliestIdx)}</span>)
      }
      tokens.push(<span key={key++} className={earliestPattern.cls}>{earliest[0]}</span>)
      remaining = remaining.slice(earliestIdx + earliest[0].length)
    }

    return tokens
  }

  const lines = code.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>{highlightLine(line)}</div>
      ))}
    </>
  )
}

/* ─── Melhoria #4: Documentação Markdown (melhorada) ─── */

function DocRenderer({ markdown }) {
  if (!markdown) return <p className="text-surface-500 text-sm p-4">Sem documentação.</p>

  // Se veio como texto corrido (sem \n), tenta quebrar em seções inteligentes
  const hasNewlines = markdown.includes('\n') && markdown.split('\n').length > 2
  
  if (!hasNewlines) {
    // Divide o texto corrido em sentenças para criar uma visualização rica
    const sentences = markdown.split(/(?<=[.!?])\s+/).filter(s => s.trim())
    
    // Tenta identificar partes do texto
    const copyName = sentences[0] || ''
    const mainFields = sentences.filter(s => /campo|field|tipo|type|pic|comp/i.test(s))
    const observations = sentences.filter(s => /observ|nota|redefine|occurs|comp-3/i.test(s))
    const otherSentences = sentences.filter(s => s !== copyName && !mainFields.includes(s) && !observations.includes(s))

    return (
      <div className="p-6 space-y-6 text-sm overflow-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-surface-800/50">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Documentação Técnica</h2>
            <p className="text-xs text-surface-500">Gerada automaticamente por IA</p>
          </div>
        </div>

        {/* Resumo Principal */}
        <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-800/50">
          <h3 className="text-xs font-semibold text-accent-300 uppercase tracking-wider mb-3">📋 Resumo do Copybook</h3>
          <p className="text-surface-300 leading-relaxed">{copyName}</p>
          {otherSentences.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {otherSentences.map((s, i) => (
                <p key={i} className="text-surface-400 leading-relaxed">{s}</p>
              ))}
            </div>
          )}
        </div>

        {/* Campos Principais */}
        {mainFields.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">🔤 Campos Identificados</h3>
            <div className="space-y-2">
              {mainFields.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-surface-800/20 border border-surface-800/40">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <p className="text-surface-300">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {observations.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">⚠️ Observações Técnicas</h3>
            <div className="space-y-2">
              {observations.map((s, i) => (
                <p key={i} className="text-surface-300 leading-relaxed">{s}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Se tem markdown com newlines, renderiza normalmente
  const lines = markdown.split('\n')
  return (
    <div className="p-5 text-sm leading-relaxed text-surface-300 overflow-auto prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('# '))       return <h1 key={i} className="text-xl font-bold text-white mb-3 mt-4">{line.slice(2)}</h1>
        if (line.startsWith('## '))      return <h2 key={i} className="text-lg font-semibold text-accent-300 mb-2 mt-4 border-b border-surface-800/50 pb-1">{line.slice(3)}</h2>
        if (line.startsWith('### '))     return <h3 key={i} className="text-base font-semibold text-surface-200 mb-2 mt-3">{line.slice(4)}</h3>
        if (line.startsWith('|'))        return <pre key={i} className="font-mono text-xs text-surface-400 leading-5">{line}</pre>
        if (line.startsWith('- '))       return <li key={i} className="ml-4 text-surface-400 list-disc">{line.slice(2)}</li>
        if (line.startsWith('**'))       return <p key={i} className="text-surface-200 font-medium my-1">{line.replace(/\*\*/g, '')}</p>
        if (line.trim() === '')          return <div key={i} className="h-2" />
        return <p key={i} className="text-surface-400 my-0.5">{line}</p>
      })}
    </div>
  )
}

/* ─── App Principal ─── */

export default function App() {
  const [cobolInput, setCobolInput] = useState(SAMPLE_COBOL)
  const [activeTab, setActiveTab] = useState('typescript')
  const [isConverting, setIsConverting] = useState(false)
  const [hasConverted, setHasConverted] = useState(false)
  const [error, setError] = useState(null)
  const [conversionTime, setConversionTime] = useState(null)

  // Saídas
  const [tsOutput, setTsOutput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [zodOutput, setZodOutput] = useState('')
  const [semanticMap, setSemanticMap] = useState([])
  const [hierarchy, setHierarchy] = useState(null)
  const [docsOutput, setDocsOutput] = useState('')

  const outputCode = useMemo(() => {
    switch (activeTab) {
      case 'typescript': return tsOutput
      case 'json': return jsonOutput
      case 'zod': return zodOutput
      default: return ''
    }
  }, [activeTab, tsOutput, jsonOutput, zodOutput])

  const isCodeTab = ['typescript', 'json', 'zod'].includes(activeTab)

  const handleConvert = async () => {
    const startTime = Date.now()
    setIsConverting(true)
    setHasConverted(false)
    setError(null)
    setConversionTime(null)
    try {
      const response = await fetch('http://localhost:3001/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cobolCode: cobolInput }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Erro HTTP ${response.status}`)
      }
      const data = await response.json()
      setTsOutput(data.typescript || '')
      setJsonOutput(typeof data.jsonSchema === 'string' ? data.jsonSchema : JSON.stringify(data.jsonSchema, null, 2))
      setZodOutput(data.zod || '')
      setSemanticMap(Array.isArray(data.semanticMap) ? data.semanticMap : [])
      setHierarchy(data.hierarchy || null)
      setDocsOutput(data.documentation || '')
      setConversionTime(((Date.now() - startTime) / 1000).toFixed(1))
      setHasConverted(true)
    } catch (err) {
      setError(err.message || 'Falha na conexão com o servidor.')
      setHasConverted(false)
    } finally {
      setIsConverting(false)
    }
  }

  const cobolLineCount = cobolInput.split('\n').length
  const outputLineCount = outputCode ? outputCode.split('\n').length : 0

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <header className="border-b border-surface-800/60 backdrop-blur-md bg-surface-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-accent-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-surface-300 tracking-tight leading-tight">
                Mainframe Bridge
              </h1>
              <p className="text-xs text-surface-500 leading-tight">
                De COBOL legado para APIs modernas em milissegundos
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <StatusPill label="Engine v3.0" color="indigo" />
            <StatusPill label="COMP-3 Ready" color="green" />
            <StatusPill label="Zod + Docs" color="amber" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0 lg:gap-0 items-stretch min-h-[600px]">

          {/* ─── Painel Esquerdo: Input COBOL ─── */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-900/50 border border-surface-800/60 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-surface-500 font-mono ml-2">input.cpy</span>
              </div>
              <span className="text-xs text-surface-600 font-mono">{cobolLineCount} linhas</span>
            </div>
            <div className="flex-1 bg-surface-900/30 border border-t-0 border-surface-800/60 rounded-b-xl overflow-hidden">
              <div className="flex h-full overflow-x-auto">
                <div className="py-4 pl-4">
                  <LineNumbers count={cobolLineCount} />
                </div>
                <textarea
                  value={cobolInput}
                  onChange={(e) => {
                    setCobolInput(e.target.value)
                    setHasConverted(false)
                  }}
                  spellCheck={false}
                  className="flex-1 bg-transparent text-emerald-400/90 font-mono text-sm leading-[1.65rem] p-4 resize-none outline-none placeholder-surface-600 w-full"
                  placeholder="Cole seu Copybook COBOL aqui..."
                />
              </div>
            </div>
          </section>

          {/* ─── Botão Central ─── */}
          <div className="flex lg:flex-col items-center justify-center py-6 lg:py-0 lg:px-6">
            <button
              onClick={handleConvert}
              disabled={isConverting || !cobolInput.trim()}
              className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm
                         bg-gradient-to-r from-accent-500 to-indigo-600
                         text-white shadow-lg shadow-accent-500/25
                         hover:shadow-xl hover:shadow-accent-500/35
                         hover:scale-[1.03]
                         active:scale-[0.97]
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg
                         transition-all duration-200 ease-out"
            >
              <span className={`transition-transform duration-500 ${isConverting ? 'animate-spin' : 'group-hover:rotate-90'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
              <span>{isConverting ? 'Analisando COBOL...' : 'Modernizar Código'}</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
            {isConverting && (
              <div className="mt-4 hidden lg:flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-surface-500">Gerando 6 saídas...</span>
              </div>
            )}
          </div>

          {/* ─── Painel Direito: Saídas ─── */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-900/50 border border-surface-800/60 rounded-t-xl">
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                      ${activeTab === tab.key
                        ? 'bg-accent-500/15 text-accent-300 shadow-sm'
                        : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
                      }`}
                  >
                    <span className="text-[10px] opacity-60">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                {hasConverted && <CopyButton text={
                  isCodeTab ? outputCode :
                  activeTab === 'semantic' ? JSON.stringify(semanticMap, null, 2) :
                  activeTab === 'hierarchy' ? JSON.stringify(hierarchy, null, 2) :
                  docsOutput
                } />}
                {hasConverted && conversionTime && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400/80">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {conversionTime}s
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 bg-surface-900/30 border border-t-0 border-surface-800/60 rounded-b-xl overflow-hidden">
              {isConverting ? (
                <ModernLoadingState />
              ) : hasConverted ? (
                <>
                  {/* Abas de código (TS, JSON, Zod) */}
                  {isCodeTab && (
                    <div className="flex h-full">
                      <div className="py-4 pl-4">
                        <LineNumbers count={outputLineCount} />
                      </div>
                      <pre className="flex-1 p-4 text-sm font-mono leading-[1.65rem] text-surface-300 overflow-auto whitespace-pre">
                        <code><SyntaxHighlight code={outputCode} language={activeTab} /></code>
                      </pre>
                    </div>
                  )}

                  {/* Melhoria #2: Mapeamento Semântico */}
                  {activeTab === 'semantic' && <SemanticMapTable data={semanticMap} />}

                  {/* Melhoria #3: Hierarquia */}
                  {activeTab === 'hierarchy' && hierarchy && (
                    <div className="p-3 overflow-auto">
                      <TreeNode node={hierarchy} />
                    </div>
                  )}

                  {/* Melhoria #4: Documentação */}
                  {activeTab === 'docs' && <DocRenderer markdown={docsOutput} />}
                </>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[400px] text-red-400/80 p-8 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Erro na conversão</h3>
                  <p className="text-sm text-red-400/60 max-w-xs">{error}</p>
                </div>
              ) : (
                <ModernEmptyState />
              )}
            </div>
          </section>
        </div>

        {/* ─── Feature Cards ─── */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: 'TypeScript', desc: 'Interfaces tipadas com Union Types e camelCase automático.', color: 'text-blue-400' },
            { title: 'JSON Schema', desc: 'Draft-07 com validação de tipos e propriedades requeridas.', color: 'text-emerald-400' },
            { title: 'Zod Schema', desc: 'Validação runtime com esquemas Zod inferidos da estrutura.', color: 'text-purple-400' },
            { title: 'Mapeamento', desc: 'De-para semântico com offset e tamanho em bytes calculados.', color: 'text-amber-400' },
            { title: 'Hierarquia', desc: 'Tree view interativo com níveis, PIC clauses e expansão.', color: 'text-cyan-400' },
            { title: 'Documentação', desc: 'Markdown com descrição de cada campo gerado por IA.', color: 'text-pink-400' },
          ].map((f) => (
            <div key={f.title} className="group p-4 rounded-xl border border-surface-800/50 bg-surface-900/20 hover:border-accent-500/30 hover:bg-surface-900/40 transition-all duration-300">
              <h3 className={`text-sm font-semibold mb-1 ${f.color}`}>{f.title}</h3>
              <p className="text-[11px] text-surface-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-surface-800/40 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-surface-600">Mainframe Bridge v3.0 &mdash; Modernização Completa</span>
          <span className="text-xs text-surface-700">COBOL → TS + JSON + Zod + Docs</span>
        </div>
      </footer>
    </div>
  )
}
