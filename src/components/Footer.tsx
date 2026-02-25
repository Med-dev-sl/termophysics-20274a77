import { Atom, Mail, Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center">
                <Atom className="w-6 h-6 text-termo-light-orange" />
              </div>
              <h3 className="font-display font-bold text-lg">
                Termo<span className="text-termo-light-orange">Physics</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Learn physics with AI-powered explanations and visual illustrations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/chat" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Launch App
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-termo-light-orange transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#team" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Team
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-termo-light-orange transition">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} TermoPhysics. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted hover:bg-termo-light-orange/20 flex items-center justify-center text-muted-foreground hover:text-termo-light-orange transition"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted hover:bg-termo-light-orange/20 flex items-center justify-center text-muted-foreground hover:text-termo-light-orange transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted hover:bg-termo-light-orange/20 flex items-center justify-center text-muted-foreground hover:text-termo-light-orange transition"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@termophysics.com"
              className="w-10 h-10 rounded-lg bg-muted hover:bg-termo-light-orange/20 flex items-center justify-center text-muted-foreground hover:text-termo-light-orange transition"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
