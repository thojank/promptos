import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200 font-sans">
      <main className="min-h-screen w-full max-w-5xl mx-auto py-20 px-4">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-base-content/60 mb-3">PROMPT-OS</p>
          <h1 className="headline-scope text-4xl md:text-5xl font-bold mb-4">
            Build Worlds, Not Just Images.
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            The Era of &quot;Prompt Guessing&quot; is Over. Stop wasting hours on 500-word text walls that never give you the same result twice. PROMPT-OS transforms your creative vision into structured, modular data.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/character" className="btn btn-primary">Create Your Free Library</Link>
            <Link href="/login" className="btn btn-outline">Talk to Sales for Agency Access</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="text-xl font-semibold">From Creative Chaos to Modular Precision.</h2>
              <p className="text-sm text-base-content/70">
                Most AI tools treat prompts like a lottery. We treat them like Architecture. Our Gemini-powered engine deconstructs your ideas into a model-agnostic Universal JSON Schema.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-base-content/70">
                <li><strong>Subject Injection:</strong> Define a character once and keep them consistent across every frame.</li>
                <li><strong>Environment Presets:</strong> Switch locations, lighting, and moods without breaking your main subject.</li>
                <li><strong>Style DNA:</strong> Extract the aesthetic essence of any image and save it as a reusable JSON module.</li>
              </ul>
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="text-xl font-semibold">Engineered for Professionals.</h2>
              <p className="text-sm text-base-content/70">
                Built on a high-performance FastAPI backend and Supabase infrastructure, PROMPT-OS is designed for scale and consistency.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-base-content/70">
                <div><strong>The Character Vault:</strong> Store digital identities with strict visual descriptors.</div>
                <div><strong>Vision Analysis:</strong> Upload any reference image and get editable JSON parameters.</div>
                <div><strong>Multi-Model Support:</strong> Banana-Pro, Z-Image-Turbo, and soon FLUX.</div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold">The Character Vault</h3>
              <p className="text-sm text-base-content/70">Don’t just describe a person—store their digital identity with strict visual descriptors.</p>
              <div className="card-actions mt-4">
                <Link href="/character" className="btn btn-primary btn-sm">Open Library</Link>
              </div>
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Vision Analysis</h3>
              <p className="text-sm text-base-content/70">Translate reference images into actionable JSON parameters you can refine.</p>
              <div className="card-actions mt-4">
                <Link href="/prompt" className="btn btn-primary btn-sm">Analyze Image</Link>
              </div>
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Multi-Model Support</h3>
              <p className="text-sm text-base-content/70">One schema, infinite possibilities across Banana-Pro, Z-Image-Turbo, and soon FLUX.</p>
              <div className="card-actions mt-4">
                <Link href="/prompt" className="btn btn-primary btn-sm">Try the Adapter</Link>
              </div>
            </div>
          </section>
        </div>

        <div className="w-full mt-12 card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="text-xl font-semibold">The Roadmap to 100% Control.</h2>
            <p className="text-sm text-base-content/70">
              We are rapidly evolving from a prompt generator to a full-scale Narrative Engine.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-base-content/70">
              <div>
                <strong>Phase 1 & 2 (Live):</strong> Text/Image-to-JSON, Character Library, and Model-Agnostic Assembler.
              </div>
              <div>
                <strong>Phase 3 (Coming Soon):</strong> Direct Civitai API imports and a native ComfyUI Node to bridge your library with your local workflow.
              </div>
              <div>
                <strong>Phase 4 (Future):</strong> Modular Storytelling and Video-Sequence Prompts for cinematic consistency.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-3">Stop Prompting. Start Constructing.</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/character" className="btn btn-primary">Create Your Free Library</Link>
            <Link href="/login" className="btn btn-outline">Talk to Sales for Agency Access</Link>
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-base-content/60">
          &copy; {new Date().getFullYear()} PROMPT-OS
        </footer>
      </main>
    </div>
  );
}
