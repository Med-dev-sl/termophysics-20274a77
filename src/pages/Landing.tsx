import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Atom, ArrowRight, Mail, Phone, MapPin, Zap, Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/InquiryForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-inset-top">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-termo-deep-blue to-termo-deep-blue-dark flex items-center justify-center flex-shrink-0">
              <Atom className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
            </div>
            <h1 className="font-display font-bold text-base sm:text-lg md:text-xl text-foreground truncate">
              Termo<span className="termo-gradient-text">Physics</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-end">
            <a href="#about" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.about")}
            </a>
            <a href="#team" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.team")}
            </a>
            <a href="#contact" className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition">
              {t("landing.nav.contact")}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="hero" size="sm" onClick={() => navigate("/chat")} className="text-xs sm:text-sm px-2 sm:px-4">
              {t("landing.nav.launchApp")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            {t("landing.hero.title").split(" ").map((word, i) => (
              word.toLowerCase() === "physics" ? (
                <span key={i} className="termo-gradient-text">
                  {word}{" "}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            ))}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            {t("landing.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2">
            <Button size="lg" onClick={() => navigate("/chat")} className="gap-2 text-sm sm:text-base w-full sm:w-auto">
              {t("landing.hero.getStarted")} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowInquiry(true)} className="text-sm sm:text-base w-full sm:w-auto">
              {t("landing.hero.learnMore")}
            </Button>
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-xl mx-2 sm:mx-0">
            <img
              src="https://i.pinimg.com/736x/35/a2/24/35a22444c80ebe60f6d6582533c3c7b8.jpg"
              alt="Physics Learning"
              className="w-full h-48 sm:h-64 md:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-3 sm:px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-16">{t("landing.features.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-background rounded-lg sm:rounded-xl p-4 sm:p-8 border border-border hover:border-termo-light-orange/50 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("landing.features.aiTitle")}</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("landing.features.aiDesc")}
              </p>
            </div>

            <div className="bg-background rounded-lg sm:rounded-xl p-4 sm:p-8 border border-border hover:border-termo-light-orange/50 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("landing.features.visualTitle")}</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("landing.features.visualDesc")}
              </p>
            </div>

            <div className="bg-background rounded-lg sm:rounded-xl p-4 sm:p-8 border border-border hover:border-termo-light-orange/50 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center mb-3 sm:mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("landing.features.pathTitle")}</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("landing.features.pathDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{t("landing.about.title")}</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                {t("landing.about.desc1")}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                {t("landing.about.desc2")}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t("landing.about.desc3")}
              </p>
            </div>
            <div className="order-1 md:order-2 rounded-lg sm:rounded-xl overflow-hidden border border-border shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=600&fit=crop"
                alt="About TermoPhysics"
                className="w-full h-60 sm:h-80 md:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 sm:py-20 px-3 sm:px-4 bg-card/50">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-16">{t("landing.team.title")}</h3>
          <div className="bg-background rounded-lg sm:rounded-xl p-6 sm:p-12 border border-border text-center">
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-termo-light-orange/20">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-termo-light-orange" />
              </div>
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t("landing.team.coming")}</h4>
            <p className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-4 px-2">
              {t("landing.team.desc")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              {t("landing.team.checkBack")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-16">{t("landing.contact.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.email")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{t("landing.contact.emailContact")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{t("landing.contact.emailSupport")}</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.phone")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.phoneMain")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.phoneSecondary")}</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-termo-light-orange/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-termo-light-orange" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{t("landing.contact.office")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.street")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.contact.city")}</p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-3 sm:px-4 bg-gradient-to-r from-termo-deep-blue/10 to-termo-light-orange/10 safe-area-inset-bottom">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{t("landing.cta.title")}</h3>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
            {t("landing.cta.desc")}
          </p>
          <Button size="lg" onClick={() => navigate("/chat")} className="gap-2 text-sm sm:text-base w-full sm:w-auto px-4">
            {t("landing.cta.launchNow")} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
