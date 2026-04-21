type SystemPlaceholderPageProps = {
  title: string
  description: string
}

export default function SystemPlaceholderPage({
  title,
  description,
}: SystemPlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <span className="placeholder-kicker">Modulo do sistema</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}
