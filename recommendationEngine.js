/**
 * Image naming convention:
 * {occasion}{skintone}{style}{gender}{number}
 * occasion: casual, formal, party, ethnic, sports
 * skintone: fair, dusky, dark
 * style: minimal, trad, trendy
 * gender: m, f
 * number: 1, 2
 *
 * Example: casualduskytradm1.jpg
 */

function mapSkinTone(skinTone) {
  const s = (skinTone || "").toLowerCase();
  if (s === "fair") return "fair";
  if (s === "medium" || s === "olive") return "dusky";
  if (s === "dark") return "dark";
  return "dusky";
}

function mapStyle(stylePreference) {
  const s = (stylePreference || "").toLowerCase();
  if (s === "minimal") return "minimal";
  if (s === "classic" || s === "ethnic" || s.includes("trad")) return "trad";
  if (s === "trendy" || s === "streetwear") return "trendy";
  return "minimal";
}

function mapGender(gender) {
  const g = (gender || "").toLowerCase();
  if (g === "male" || g === "m") return "m";
  if (g === "female" || g === "f") return "w";
  return "m";
}

function mapOccasion(occasion) {
  const o = (occasion || "").toLowerCase();
  if (o === "formal") return "formal";
  if (o === "party") return "party";
  if (o === "ethnic") return "ethnic";
  if (o === "sports") return "sports";
  return "casual";
}

function getOutfitImages(input) {
  const { occasion, skinTone, stylePreference, gender } = input;

  const occ = mapOccasion(occasion);
  const skin = mapSkinTone(skinTone);
  const style = mapStyle(stylePreference);
  const gen = mapGender(gender);

  const img1 = `assets/outfits/${occ}${skin}${style}${gen}1.jpg`;
  const img2 = `assets/outfits/${occ}${skin}${style}${gen}2.jpg`;
  return [img1, img2];
}

function unique(list) {
  return [...new Set(list)];
}

function buildRecommendation(input) {
  const {
    gender,
    bodyType,
    occasion,
    skinTone,
    height,
    stylePreference,
  } = input;

  const outfitItems = [];
  const accessories = [];
  const fabrics = [];
  const colors = [];
  const stylingTips = [];

  /* ── BODY TYPE ── */
  const bt = (bodyType || "").toLowerCase();

  if (bt === "pear") {
    outfitItems.push("A-line dress", "Structured blazer", "Boot-cut trousers");
    stylingTips.push("Highlight your upper body to balance proportions");
  } else if (bt === "apple") {
    outfitItems.push("Empire waist dress", "V-neck top", "Wrap blouse");
    stylingTips.push("Choose flowy fabrics that skim the midsection");
  } else if (bt === "rectangle") {
    outfitItems.push("Peplum top", "Layered outfits", "Belted dresses");
    stylingTips.push("Add visual curves with belts and layered styling");
  } else if (bt === "hourglass") {
    outfitItems.push("Wrap dress", "High-waist pants", "Fitted midi skirt");
    stylingTips.push("Celebrate your natural waistline with fitted silhouettes");
  } else if (bt === "oval") {
    outfitItems.push("Straight-leg trousers", "Longline jacket");
    stylingTips.push("Vertical lines and monochrome looks create a streamlined effect");
  } else if (bt === "trapezoid") {
    outfitItems.push("Slim-fit shirt", "Dark trousers");
    stylingTips.push("Keep it simple and well-fitted on top");
  }

  /* ── OCCASION ── */
  const occ = (occasion || "").toLowerCase();

  if (occ === "formal") {
    outfitItems.push("Tailored blazer", "Formal trousers / pencil skirt");
    accessories.push("Classic watch", "Minimal gold jewelry", "Leather belt");
    stylingTips.push("Stick to a two-colour palette for a polished look");
  } else if (occ === "casual") {
    outfitItems.push("Well-fitted jeans", "Relaxed linen shirt / tee");
    accessories.push("White sneakers", "Canvas tote bag");
    stylingTips.push("Comfort is key — opt for breathable, relaxed fits");
  } else if (occ === "ethnic") {
    outfitItems.push("Embroidered kurta", "Anarkali / sherwani");
    accessories.push("Ethnic jhumkas / mojris", "Silk dupatta / pocket square");
    stylingTips.push("Pair rich fabrics with handcrafted accessories");
  } else if (occ === "party") {
    outfitItems.push("Statement blouse / fitted blazer", "Sequin or satin accents");
    accessories.push("Bold earrings / statement watch", "Clutch bag");
    stylingTips.push("One bold piece is enough — let it be the hero");
  } else if (occ === "sports") {
    outfitItems.push("Moisture-wicking tee", "Stretch joggers / leggings");
    accessories.push("Sports shoes", "Sweat-resistant cap");
    stylingTips.push("Prioritise functional fabrics over fashion");
  }

  /* ── SKIN TONE → COLOURS ── */
  const skin = (skinTone || "").toLowerCase();

  if (skin === "fair") {
    colors.push("Pastels", "Baby Blue", "Blush Pink", "Lavender", "Soft Mint");
  } else if (skin === "medium" || skin === "olive") {
    colors.push("Terracotta", "Olive Green", "Warm Mustard", "Rust", "Camel");
  } else if (skin === "dark") {
    colors.push("Cobalt Blue", "Emerald", "Bright White", "Burnt Orange", "Deep Plum");
  } else {
    colors.push("Beige", "Soft Pink", "Teal", "Ivory");
  }

  /* ── HEIGHT ── */
  const h = (height || "").toLowerCase();

  if (h === "short") {
    stylingTips.push("High-waisted bottoms and vertical stripes add visual height");
    outfitItems.push("Cropped jacket");
  } else if (h === "tall") {
    stylingTips.push("You can pull off maxi lengths and oversized silhouettes effortlessly");
  }

  /* ── STYLE PREFERENCE ── */
  const style = (stylePreference || "").toLowerCase();

  if (style === "minimal") {
    stylingTips.push("Limit your palette to 2–3 neutral tones per outfit");
    fabrics.push("Cotton", "Linen", "Jersey");
  } else if (style === "trendy" || style === "streetwear") {
    outfitItems.push("Oversized silhouette", "Statement sneakers");
    accessories.push("Bucket hat / cap");
    fabrics.push("Denim", "Nylon", "Fleece");
  } else if (style === "classic") {
    outfitItems.push("Crisp white shirt", "Tailored trousers");
    fabrics.push("Cotton-blend", "Wool-blend", "Silk");
    stylingTips.push("Quality over quantity — invest in timeless pieces");
  } else if (style === "ethnic" || style.includes("trad")) {
    fabrics.push("Silk", "Chiffon", "Handloom cotton");
    stylingTips.push("Mix traditional weaves with contemporary cuts");
  }

  /* ── FALLBACK FABRICS ── */
  if (fabrics.length === 0) fabrics.push("Cotton", "Linen");

  /* ── OUTFIT IMAGES ── */
  const outfitImages = getOutfitImages(input);

  return {
    outfitRecommendation: unique(outfitItems),
    accessorySuggestions: unique(accessories),
    recommendedColorPalette: unique(colors),
    suitableFabrics: unique(fabrics),
    stylingTips: unique(stylingTips),
    outfitImages,
  };
}

module.exports = { buildRecommendation };