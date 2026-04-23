type DeveloperSignatureProps = {
  className?: string
}

export default function DeveloperSignature({
  className = '',
}: DeveloperSignatureProps) {
  return (
    <div className={`developer-signature ${className}`.trim()}>
      <span className="developer-signature-text">
        Desenvolvido por <strong>Mateus Henrique</strong>
      </span>

      <div className="developer-signature-links">
        <a
          className="developer-signature-link"
          href="https://github.com/mateusboica"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>

        <span className="developer-signature-separator" aria-hidden="true">
          •
        </span>

        <a
          className="developer-signature-link"
          href="#"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
      </div>
    </div>
  )
}
