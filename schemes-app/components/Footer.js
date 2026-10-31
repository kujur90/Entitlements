// Stays in English always, same reasoning as the header: this is a fixed
// legal/trust notice, not page content that should shift with the language
// picker.
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-paddy-200/70">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="max-w-measure text-sm text-ink/70">
          This is an independent information service, not a government website. Always confirm
          details at the official source link before applying.
        </p>
      </div>
    </footer>
  );
}
