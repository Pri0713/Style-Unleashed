function unique(list) {
  return [...new Set(list)];
}

function buildRecommendation(input) {
  const {
    gender,
    bodyType,
    occasion,
    season,
    skinTone,
    height,
    stylePreference,
  } = input;

  const outfit = [];
  const accessories = [];
  const colors = [];
  const fabrics = [];
  const tips = [];

  let heroImage =
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80";

  // 1️⃣ Occasion rules (highest priority)
  switch (occasion) {
    case "casual":
      outfit.push("Denim and breathable t-shirt combination");
      outfit.push("Pastel top with clean-cut bottoms");
      accessories.push("Sneakers", "Watch", "Sling bag");
      heroImage =
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80";
      break;

    case "formal":
      if (gender === "female")
        outfit.push("Structured saree or elegant suit set");
      else
        outfit.push("Tailored blazer with formal shirt and trousers");

      accessories.push("Leather shoes", "Tie", "Stud earrings");

      heroImage =
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=80";
      break;

    case "ethnic":
      outfit.push("Kurta / lehenga / saree inspired look");
      accessories.push("Bangles", "Jhumkas", "Dupatta styling");

      heroImage =
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80";
      break;

    case "party":
      outfit.push("Gown or statement party outfit");
      outfit.push("Sequin/silk evening styling");
      accessories.push("Heels", "Clutch", "Statement jewelry");

      heroImage =
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80";
      break;

    case "festive":
      outfit.push("Traditional festive attire such as lehenga or kurta set");
      accessories.push("Statement earrings", "Bangles", "Ethnic footwear");

      heroImage =
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80";
      break;

    default:
      outfit.push("Balanced smart-casual outfit");
  }

  // 2️⃣ Body type rules
  if (["rectangle", "trapezoid"].includes(bodyType)) {
    fabrics.push("Denim", "Tweed", "Corduroy");
    tips.push("Use checks or layered styling to add structure.");
  }

  if (["oval", "apple"].includes(bodyType)) {
    fabrics.push("Linen", "Cotton", "Silk");
    tips.push("Vertical stripes help create a longer silhouette.");
  }

  if (bodyType === "pear") {
    tips.push("Add visual interest to the upper body to balance proportions.");
  }

  if (bodyType === "hourglass") {
    tips.push("Highlight your waist with fitted silhouettes or belts.");
  }

  // 3️⃣ Season rules
  switch (season) {
    case "summer":
      fabrics.push("Cotton", "Linen");
      colors.push("Soft pastels", "Light neutrals");
      tips.push("Choose breathable fabrics for comfort.");
      break;

    case "winter":
      fabrics.push("Wool", "Cashmere", "Knits");
      colors.push("Deep tones", "Rich neutrals");
      tips.push("Layer outfits for warmth and structure.");
      break;

    case "monsoon":
      fabrics.push("Quick-dry fabrics", "Poly blends");
      tips.push("Avoid long hems and choose fast-drying fabrics.");
      break;

    default:
      break;
  }

  // 4️⃣ Combined Occasion + Season Intelligence
  if (occasion === "party" && season === "summer") {
    fabrics.push("Chiffon", "Light silk");
    tips.push("Choose breathable party fabrics for warm weather.");
  }

  if (occasion === "formal" && season === "winter") {
    fabrics.push("Velvet", "Wool blends");
    tips.push("Structured layers work well for winter formals.");
  }

  if (occasion === "ethnic" && season === "summer") {
    fabrics.push("Cotton silk", "Light linen blends");
    tips.push("Lightweight ethnic fabrics keep you comfortable.");
  }

  // 5️⃣ Height adjustments
  if (height === "short") {
    colors.push("Monochrome outfits");
    tips.push("High-waist styling and pointed footwear elongate the frame.");
  }

  if (height === "tall") {
    tips.push("Bold prints and layered styling complement tall frames.");
  }

  // 6️⃣ Style preference rules
  if (stylePreference === "bold") {
    colors.push("Complementary color combinations");
    outfit.push("Statement outfit with bold patterns");
    tips.push("Use one bold statement piece to anchor the outfit.");
  }

  if (stylePreference === "minimal") {
    colors.push("Neutral palette (beige, black, white, earth tones)");
    outfit.push("Clean monochrome outfit with tailored silhouette");
    tips.push("Minimal styling works best with sharp silhouettes.");
  }

  if (stylePreference === "traditional") {
    outfit.push("Classic heritage silhouette with modern styling");
    tips.push("Traditional textures and accessories elevate the look.");
  }

  if (stylePreference === "trendy") {
    outfit.push("Modern oversized layers with trending accessories");
    tips.push("Combine trendy pieces with timeless basics.");
  }

  // 7️⃣ Skin tone color harmony
  if (skinTone === "fair") {
    colors.push("Emerald green", "Navy blue", "Soft rose");
  }

  if (skinTone === "medium") {
    colors.push("Olive green", "Maroon", "Cobalt blue");
  }

  if (skinTone === "dusky") {
    colors.push("Mustard", "Rust", "Deep teal");
  }

  if (skinTone === "dark") {
    colors.push("Bright white", "Royal blue", "Deep jewel tones");
  }

  // 8️⃣ General styling tip
  colors.push("Dark tones for a slimming visual effect");

  return {
    outfitRecommendation: unique(outfit),
    accessorySuggestions: unique(accessories),
    recommendedColorPalette: unique(colors),
    suitableFabrics: unique(fabrics),
    stylingTips: unique(tips),
    heroImage,
  };
}

module.exports = { buildRecommendation };