import Image from "next/image";
import Link from "next/link";
import SkinQuiz from "./skin-quiz";

export default function AssessmentPage() {
  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <Link className="brand-logo-link quiz-brand-logo" href="/" aria-label="Skindrug Gist home">
          <Image className="brand-logo brand-logo-header" src="/skindrug-gist-mark-light.png" alt="Skindrug Gist" width={118} height={68} unoptimized />
        </Link>
        <Link className="quiz-home-link" href="/">Back to the website <span aria-hidden="true">↗</span></Link>
      </header>
      <SkinQuiz />
      <footer className="quiz-footer">
        Your consultation details are submitted securely through this website.
      </footer>
    </main>
  );
}
