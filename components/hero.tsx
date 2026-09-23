"use client"

import { ArrowDown, FastArrowRight, Phone } from "iconoir-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-black">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left order-2 md:order-1">
        {/* Halal Badge */}
        <div className="inline-flex items-center gap-3 mb-6">
          <img
            src="/graphics/halal logo.svg"
            alt="100% Halal Certified"
            className="h-16 w-auto"
          />
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
          <span className="text-primary">THE FOODIE</span>
          <br />
          <span className="text-foreground">WAGON</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-light tracking-wide mb-8 max-w-2xl mx-auto">
          Where Flavor Hits The Road
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Premium Halal Burger, knuspriges Fried Chicken und authentische Currywurst – direkt vom Foodtruck zu dir.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="tel:+4917622245627"
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/50 w-full sm:w-auto justify-center"
          >
            <Phone className="w-5 h-5" />
            +49 176 22245627
          </a>
          <Link
            href="#menu"
            className="group flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all w-full sm:w-auto justify-center"
          >
            SPEISEKARTE ANSEHEN
            <FastArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Location Badge with Truck Icon - Large & Prominent */}
        <div className="max-w-xl mx-auto mb-16 p-6 md:p-8 bg-primary/10 rounded-2xl border-2 border-primary/30 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <img
              src="/graphics/truck.svg"
              alt="Food Truck"
              className="h-16 w-16 md:h-20 md:w-20 object-contain flex-shrink-0"
            />
            <div className="text-left">
              <p className="text-primary font-black text-2xl md:text-3xl lg:text-4xl mb-1">Jeden Samstag</p>
              <p className="text-foreground font-bold text-base md:text-lg lg:text-xl">Am Westpark 7, Ingolstadt</p>
              <p className="text-muted-foreground text-sm md:text-base mt-1">11:00 - 20:00 Uhr</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto md:mx-0">
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">11+</p>
            <p className="text-xs sm:text-sm text-muted-foreground tracking-wide">BURGER</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">10+</p>
            <p className="text-xs sm:text-sm text-muted-foreground tracking-wide">DIPS</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">100%</p>
            <p className="text-xs sm:text-sm text-muted-foreground tracking-wide">HALAL</p>
          </div>
        </div>
          </div>

          {/* Right Content - Hero Burger */}
          <div className="order-1 md:order-2 relative">
            <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
              {/* Glow Effects */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent animate-pulse" />

              {/* Tasty Burger - Main Hero Image */}
              <img
                src="/graphics/tasty burger.svg"
                alt="Our Signature Burgers"
                className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] animate-float"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  )
}
