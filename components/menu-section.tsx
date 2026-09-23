"use client"

import { useState } from "react"
import { MenuCategory } from "./menu-category"
import { PizzaSlice as BurgerIcon, CoffeeCup, Leaf, FireFlame as Flame } from "iconoir-react"

const categories = [
  { id: "beef", label: "Beef Burger", icon: BurgerIcon },
  { id: "chicken", label: "Chicken Burger", icon: Flame },
  { id: "veggie", label: "Veggie", icon: Leaf },
  { id: "drinks", label: "Getränke", icon: CoffeeCup },
]

const menuItems = {
  beef: [
    {
      name: "Cheesy Buffalo",
      price: "10,50€",
      description: "Brioche Bun, Hausgemachte Beef Patty 140g, Käse, Burger Sauce, Gurke, Zwiebel, Tomaten, Salat",
      spiceLevel: 3,
      image: "/burgers/beef/Cheesy-Buffalo_10,50euros.webp",
    },
    {
      name: "Angry Bull",
      price: "12,00€",
      description:
        "Brioche Bun, Hausgemachte Beef Patty 140g, Käse, Chili Cheese Sauce, Jalapeno, Gurke, Zwiebel, Salat",
      spiceLevel: 3,
      image: "/burgers/beef/Angry-Bull_12euros.webp",
    },
    {
      name: "Smokie Beefy BBQ",
      price: "13,00€",
      description:
        "Brioche Bun, Hausgemachte Beef Patty 140g, Käse, Burger Sauce, Gurke, Onion Rings, Geröstete Zwiebel, BBQ Sauce, Tomaten, Salat",
      spiceLevel: 3,
      image: "/burgers/beef/Smookie-Beefy-BBQ_13euros.webp",
    },
    {
      name: "Blazing Nacho Beef",
      price: "13,00€",
      description:
        "Brioche Bun, Hausgemachte Beef Patty 140g, Käse, Burger Sauce, Gurke, Jalapeno, Nachos, Sriracha Sauce, Tomaten, Salat",
      spiceLevel: 3,
      image: "/burgers/beef/Blazing-Nacho-Beef_13euros.webp",
    },
    {
      name: "Cheese Burger",
      price: "7,00€",
      description: "Brioche Bun, Hausgemachte Beef Patty 140g, Käse, Burger Sauce, Gurke, Zwiebel, Tomaten, Salat",
      spiceLevel: 1,
      image: "/burgers/beef/Cheese-Burger_7euros.webp",
    },
  ],
  chicken: [
    {
      name: "Crunchy Chicken",
      price: "8,50€",
      description: "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Salat",
      spiceLevel: 2,
      image: "/burgers/chicken/Chrunchy-Chicken_8,50euros.webp",
    },
    {
      name: "Loaded Crunchy",
      price: "9,00€",
      description: "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Tomaten, Zwiebel, Gurke, Salat",
      spiceLevel: 2,
      image: "/burgers/chicken/Loaded-Chrunchy_9euros.webp",
    },
    {
      name: "Crispy Ringer",
      price: "10,00€",
      description: "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Onion Rings, Zwiebel, Tomaten, Salat",
      spiceLevel: 2,
      image: "/burgers/chicken/Crispy-Ringer_10euros.webp",
    },
    {
      name: "Mexican Cracker",
      price: "11,00€",
      description:
        "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Jalapeno, Gurke, Nachos, Sriracha Sauce, Zwiebel, Salat",
      spiceLevel: 2,
      image: "/burgers/chicken/Mexican-Cracker_11euros.webp",
    },
    {
      name: "Flip Chicken Burger",
      price: "6,00€",
      description: "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Salat",
      spiceLevel: 1,
      image: "/burgers/chicken/Flip-Chicken-Burger_6euros.webp",
    },
    {
      name: "Foodie Bomber",
      price: "13,00€",
      description:
        "Brioche Bun, Chicken Strips, Käse, Chili Cheese Nuggets, Chili Cheese Sauce, Zwiebel, Jalapeno, Salat",
      spiceLevel: 2,
      image: "/burgers/chicken/Foodie-Bomber-13euros.webp",
    },
  ],
  veggie: [
    {
      name: "Plant Power",
      price: "9,00€",
      description: "Brioche Bun, Falafel, Käse, Burger Sauce, Gurke, Salat, Zwiebel, Tomaten",
      spiceLevel: 0,
    },
    {
      name: "Veggie BBQ",
      price: "11,00€",
      description:
        "Brioche Bun, Falafel, Käse, Burger Sauce, Gurke, Onion Rings, Geröstete Zwiebel, BBQ Sauce, Tomaten, Salat",
      spiceLevel: 0,
    },
  ],
  drinks: [
    { name: "Coca Cola", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { name: "Coca Cola Zero", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { name: "Fanta", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { name: "Sprite", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { name: "Capri Sonne", price: "1,50€", description: "200ml", image: "/graphics/caprisun.svg" },
    { name: "Wasser", price: "2,00€", description: "500ml", image: "/graphics/water.svg" },
    { name: "Mezzo Mix", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { name: "Red Bull", price: "3,50€", description: "250ml Dose", image: "/graphics/redbull.svg" },
  ],
}

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("beef")

  return (
    <section id="menu" className="py-20 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Restaurant Style */}
        <div className="text-center mb-12">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-tighter mb-4">
            UNSERE BURGER
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto font-medium">
            Hausgemachte Beef Patties, knuspriges Fried Chicken & frische Zutaten
          </p>
        </div>

        {/* Deal Banner - Eye-Catching */}
        <div className="mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-amber-400 to-primary opacity-20 animate-pulse" />
          <div className="relative p-8 text-center border-4 border-primary rounded-3xl bg-card">
            <p className="text-3xl md:text-5xl font-black text-primary tracking-tight mb-2">
              MENÜ DEAL
            </p>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              Burger + Pommes + Getränk = <span className="text-primary">nur €4,50</span>
            </p>
          </div>
        </div>

        {/* Category Tabs - Bold Restaurant Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg tracking-tight transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/50 scale-105"
                    : "bg-card border-2 border-border text-foreground hover:border-primary/50 hover:scale-105"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>

        {/* Menu Items */}
        <MenuCategory items={menuItems[activeCategory as keyof typeof menuItems]} />

        {/* Sides & Extras - Floating Style */}
        <div className="mt-24 space-y-16">
          {/* Appetizers Section */}
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-12 tracking-tighter text-center">
              APPETIZERS & SIDES
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { name: "Chili Cheese Nuggets", image: "/Appetizers/Chilli-Cheese-Nuggets.webp", prices: "6 Stk 5€ • 10 Stk 7,50€ • 16 Stk 11€" },
                { name: "Mozzarella Sticks", image: "/Appetizers/Mozarella-Sticks.webp", prices: "4 Stk 5€ • 8 Stk 9€ • 14 Stk 14€" },
                { name: "Onion Rings", image: "/Appetizers/Onion-Rings.webp", prices: "6 Stk 4€ • 12 Stk 7€ • 24 Stk 12€" },
                { name: "Pommes Portion", image: "/Appetizers/Pommes_3,5euros.webp", prices: "3,50€", featured: true }
              ].map((item) => (
                <div
                  key={item.name}
                  className="group relative cursor-pointer"
                >
                  <div className="relative w-full aspect-square mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    {/* Halal Badge - Bottom Left Corner */}
                    <div className="absolute bottom-2 left-2 z-20 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src="/graphics/halal logo.svg"
                        alt="100% Halal"
                        className="h-10 w-10 md:h-12 md:w-12 drop-shadow-lg"
                      />
                    </div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500"
                      style={{ filter: 'drop-shadow(0 8px 20px rgba(251, 191, 36, 0.2))' }}
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{item.name}</h4>
                    <p className={`font-bold ${item.featured ? 'text-2xl text-primary' : 'text-sm text-primary'}`}>
                      {item.prices}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fried Chicken Section */}
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-12 tracking-tighter text-center">
              FRIED CHICKEN
            </h3>
            <div className="grid sm:grid-cols-2 gap-12">
              {[
                { name: "Chicken Wings", image: "/Fried-Chicken/Chicken-Wings.webp", prices: "6 Stk 7,50€ • 10 Stk 11€ • 20 Stk 20€" },
                { name: "Chicken Strips", image: "/Fried-Chicken/Chicken-Stripes.webp", prices: "3 Stk 6€ • 6 Stk 11,50€ • 9 Stk 16€" }
              ].map((item) => (
                <div
                  key={item.name}
                  className="group relative cursor-pointer"
                >
                  <div className="relative w-full aspect-video mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                    {/* Halal Badge - Bottom Left Corner */}
                    <div className="absolute bottom-2 left-2 z-20 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src="/graphics/halal logo.svg"
                        alt="100% Halal"
                        className="h-12 w-12 md:h-14 md:w-14 drop-shadow-lg"
                      />
                    </div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_25px_70px_rgba(0,0,0,0.4)] transition-all duration-500"
                      style={{ filter: 'drop-shadow(0 10px 25px rgba(251, 191, 36, 0.25))' }}
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl lg:text-3xl font-black text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">{item.name}</h4>
                    <p className="text-lg font-bold text-primary">{item.prices}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dips Section - Restaurant Menu Style */}
        <div className="mt-16">
          <h3 className="text-4xl md:text-5xl font-black text-primary mb-12 tracking-tighter text-center">
            SAUCEN & DIPS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { name: "Mayo", price: "0,50€" },
              { name: "Ketchup", price: "0,50€" },
              { name: "Garlic Flip", price: "1,00€" },
              { name: "Blazing BBQ", price: "1,00€" },
              { name: "Super Curry", price: "1,00€" },
              { name: "Dragon's Flame", price: "1,00€" },
              { name: "Smokie Volcano", price: "1,00€" },
              { name: "Sweet Chili Magic", price: "1,00€" },
              { name: "Tangy Chili Cheese", price: "1,00€" },
              { name: "Foodie Burger Sauce", price: "1,00€" },
            ].map((dip) => (
              <div
                key={dip.name}
                className="group cursor-pointer"
              >
                <div className="relative w-full aspect-square mb-3">
                  <img
                    src="/graphics/dips.svg"
                    alt={dip.name}
                    className="w-full h-full object-contain group-hover:-translate-y-1 transition-transform duration-300"
                  />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                    {dip.name}
                  </p>
                  <p className="text-primary font-black text-lg">{dip.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
