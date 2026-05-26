export default function Footer({ onDemo }: { onDemo: () => void }) {
  return (
    <footer className="border-t border-line bg-white">
      <div className="max-w-[1280px] mx-auto px-8 lg:px-16 py-10 grid lg:grid-cols-[1.2fr_2fr_1fr] gap-10">
        <div>
          <p className="text-ink text-base font-extrabold">Sceneva</p>
          <p className="text-sub text-xs leading-5 font-semibold mt-2.5">AI room visualizer for online rug retailers. Built so shoppers can see your rug in their room before they buy.</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <p className="text-ink text-xs font-bold mb-2">Product</p>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="#features">Features</a>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="#pricing">Pricing</a>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="/docs/install-shopify">Docs</a>
          </div>
          <div>
            <p className="text-ink text-xs font-bold mb-2">Company</p>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="/contact">Contact</a>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="mailto:hello@sceneva.com">hello@sceneva.com</a>
          </div>
          <div>
            <p className="text-ink text-xs font-bold mb-2">Legal</p>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="/privacy">Privacy</a>
            <a className="text-sub text-xs font-bold block py-1 hover:text-ink" href="/terms">Terms</a>
          </div>
        </div>
        <div>
          <p className="text-ink text-xs font-bold">Launch your store demo</p>
          <p className="text-sub text-xs leading-5 font-semibold mt-2.5">Open the live widget demo and see the store install flow.</p>
          <button onClick={onDemo} className="mt-3.5 h-9 px-4 rounded-lg bg-brand text-white text-xs font-extrabold hover:bg-brand-dark transition-colors">
            Open Live Demo
          </button>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-[1280px] mx-auto px-8 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-sub font-semibold">
          <p>© {new Date().getFullYear()} Sceneva. All rights reserved.</p>
          <p>Made with care for rug retailers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
