(() => {
  const PHONE = "919873155544";

  // Comprehensive Knowledge Base with Exact Entity Alignments
  const knowledge = [
    {
      id: "manan",
      keys: ["manan", "manan nanda", "experiential", "theatrical"],
      priority: 150,
      answer: "Manan Nanda is the Director & Experiential Gastronomy Lead at SK Nanda F&B. Representing the modern culinary vanguard of the house, Manan spearheads global culinary research, avant-garde presentation aesthetics, and interactive theatrical dining. He conceptualized and curated SK Nanda's acclaimed 22+ theatrical live stations—ranging from flame-charred Robata grills and hand-pulled noodles to liquid nitrogen dessert installations."
    },
    {
      id: "pratik",
      keys: ["pratik", "pratik nanda", "operations", "logistics"],
      priority: 150,
      answer: "Pratik Nanda is the Managing Director & Operations Architect at SK Nanda F&B. Pratik pioneered cold-chain mobility, modular field kitchens capable of operating in remote palace destinations and heritage forts, and standardized HACCP-certified kitchen management. His logistical architecture enables SK Nanda F&B to effortlessly execute three-day destination weddings for thousands of guests across Udaipur, Goa, Jaipur, and Dubai."
    },
    {
      id: "sk_nanda",
      keys: ["sk nanda", "s.k. nanda", "surinder", "surinder kumar", "founder"],
      priority: 140,
      answer: "Mr. S.K. Nanda is the Founder and Managing Director of SK Nanda Catering, established in 1997. Over 28+ years, Mr. Nanda built the house on uncompromising culinary purity, personal integrity, and authentic Indian hospitality. He spent decades perfecting slow-fire Awadhi dum cooking, artisanal Punjabi tandoor, and proprietary spice blends sourced from heritage purveyors."
    },
    {
      id: "full_menu",
      keys: ["menu", "full menu", "dishes", "food", "what food", "items", "options", "cuisines", "culinary"],
      priority: 90,
      answer: "SK Nanda F&B offers over 200 bespoke dishes across 30+ culinary traditions. From 22 regional Indian culinary worlds (Awadhi, Kashmiri, Punjabi, Rajasthani, Coastal) to Pan-Asian, Mediterranean, and European repertoires, every menu is written specifically around your occasion. You can explore our dedicated Full Menu page using the 'View full menu' button or contact our directors on WhatsApp for custom tastings."
    },
    {
      id: "live_stations",
      keys: ["station", "live station", "live counter", "counter", "theatre", "robata", "chaat", "sushi", "pasta", "nitrogen"],
      priority: 100,
      answer: "We offer 22 signature interactive live stations that bring the kitchen into the ballroom! Highlights include: Chaat Royale Bazaar, Robata Charcoal Grill, Artisanal Sushi & Sashimi Bar, Neapolitan Wood-Fired Pizza, Handcrafted Truffle Pasta Wheel, Dim Sum Steamers, Turkish Shawarma, and Liquid Nitrogen Cryo Dessert Theatre."
    },
    {
      id: "wedding",
      keys: ["wedding", "shaadi", "reception", "sangeet", "mehendi", "cocktail", "pheras", "haldi"],
      priority: 95,
      answer: "Weddings are our signature craft. SK Nanda F&B orchestrates complete multi-day culinary experiences—from bespoke Chaat & Street Food bazaars for Mehendi, to high-energy global grazing stations for Sangeet, and regal Awadhi & Royal Indian banquets for the wedding reception. Every course is timed to the rhythm of your ceremonies."
    },
    {
      id: "destination",
      keys: ["destination", "location", "cities", "delhi", "udaipur", "jaipur", "goa", "dubai", "pan india", "international", "where do you serve"],
      priority: 90,
      answer: "We execute luxury catering across Delhi NCR, pan-India destinations (including Udaipur, Jaipur, Jodhpur, Goa, Mumbai, Chandigarh), and international celebrations across Dubai, Thailand, and Europe. Our mobile kitchen setups and cold-chain logistics ensure 5-star precision anywhere in the world."
    },
    {
      id: "pricing",
      keys: ["price", "cost", "pricing", "packages", "quote", "budget", "per plate", "rate"],
      priority: 85,
      answer: "Because we refuse templated food, we have no rigid fixed packages. Every quotation is tailored to your specific guest count, event date, venue location, culinary selection, and theatrical live stations. Share your celebration brief on WhatsApp (+91 98731 55544) and our directors will prepare an exact proposal."
    },
    {
      id: "quality_kitchen",
      keys: ["kitchen", "hygiene", "purity", "haccp", "safety", "clean", "organic", "ghee"],
      priority: 85,
      answer: "Our operations adhere to strict HACCP food safety standards and 6-step culinary protocol. We use only cold-pressed oils, pure A2 desi cow ghee, single-origin hand-ground spices, and direct organic farm produce with zero artificial preservatives or food dyes."
    },
    {
      id: "careers",
      keys: ["career", "job", "hiring", "work", "chef", "internship", "apply"],
      priority: 80,
      answer: "SK Nanda F&B is always looking for passionate culinary talent, pastry chefs, banquet operations managers, and front-of-house hospitality professionals. Visit our Careers section or message our team directly on WhatsApp with your CV."
    },
    {
      id: "contact_booking",
      keys: ["contact", "book", "call", "whatsapp", "phone", "number", "email", "address", "office"],
      priority: 80,
      answer: "You can reach SK Nanda F&B directly by WhatsApp or call at +91 98731 55544. Our production estate is located at Farm No. 3, Kh. No. 113/14, Bijwasan Kapashera Village, Behind Oberoi Farm, New Delhi – 110037."
    },
    {
      id: "about_company",
      keys: ["about", "company", "who are you", "what is sk nanda", "overview", "heritage", "history"],
      priority: 60,
      answer: "SK Nanda F&B is a premier luxury catering institution established in 1997. Directed by Mr. S.K. Nanda alongside Pratik Nanda and Manan Nanda, the house marries 28+ years of royal Indian culinary heritage with avant-garde global dining and destination-scale logistical mastery."
    }
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[char]);

  function findAnswer(input) {
    const raw = input.toLowerCase().trim();
    if (!raw) return "Welcome to SK Nanda F&B. How may I assist your celebration planning today?";

    // Clean punctuation
    const query = raw.replace(/[?!.,;:'"()]/g, " ");
    const words = query.split(/\s+/).filter(Boolean);

    let bestMatch = null;
    let highestScore = 0;

    for (const item of knowledge) {
      let score = 0;

      for (const key of item.keys) {
        // Direct exact substring match
        if (query.includes(key)) {
          score += (item.priority || 50) + key.length * 10;
        } else {
          // Word-by-word match
          const keyWords = key.split(/\s+/);
          const matchedWords = keyWords.filter(kw => words.includes(kw));
          if (matchedWords.length === keyWords.length) {
            score += (item.priority || 50);
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (highestScore > 0 && bestMatch) {
      return bestMatch.answer;
    }

    return "Thank you for asking. SK Nanda F&B specializes in bespoke luxury catering for weddings, milestone anniversaries, and corporate galas. Please share your event date, city, and approximate guest count, or connect directly with our directors on WhatsApp at +91 98731 55544.";
  }

  // Styles for the Concierge
  const style = document.createElement("style");
  style.id = "skn-concierge-styles";
  style.textContent = `
    :root {
      --skn-wine: #591a2a;
      --skn-wine-dark: #3b0e1b;
      --skn-cream: #f4ece2;
      --skn-gold: #d4b25a;
      --skn-ink: #1c0d16;
    }
    .skn-concierge-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 8, 12, 0.72);
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
      z-index: 99990;
    }
    .skn-concierge-panel {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: min(440px, calc(100vw - 28px));
      height: min(720px, calc(100svh - 40px));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(212, 178, 90, 0.45);
      border-radius: 28px;
      background: #180913;
      color: #f4ece2;
      box-shadow: 0 35px 100px rgba(0, 0, 0, 0.85);
      transform: translateY(24px) scale(0.98);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
      z-index: 99995;
      font-family: Inter, sans-serif;
    }
    .skn-concierge-open .skn-concierge-backdrop {
      opacity: 1;
      pointer-events: auto;
    }
    .skn-concierge-open .skn-concierge-panel {
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }
    .skn-concierge-head {
      position: relative;
      padding: 24px 24px 20px;
      background: linear-gradient(145deg, #300d1c, #481228);
      border-bottom: 1px solid rgba(212, 178, 90, 0.25);
      color: #f4ece2;
    }
    .skn-concierge-title {
      position: relative;
      z-index: 1;
      margin: 0;
      font-family: 'Source Serif 4 Variable', Georgia, serif;
      font-size: 26px;
      font-weight: 300;
      letter-spacing: -0.02em;
    }
    .skn-concierge-kicker {
      position: relative;
      z-index: 1;
      margin: 0 0 6px;
      color: #d4b25a;
      font-size: 10px;
      font-family: monospace;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      font-weight: 600;
    }
    .skn-concierge-status {
      position: relative;
      z-index: 1;
      margin: 6px 0 0;
      color: rgba(244, 236, 226, 0.8);
      font-size: 12px;
      font-weight: 300;
    }
    .skn-concierge-close {
      position: absolute;
      right: 18px;
      top: 18px;
      z-index: 2;
      width: 36px;
      height: 36px;
      border: 1px solid rgba(212, 178, 90, 0.4);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      color: #f4ece2;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .skn-concierge-close:hover {
      background: rgba(212, 178, 90, 0.2);
    }
    .skn-concierge-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;
      background: #140710;
    }
    .skn-msg {
      max-width: 88%;
      margin: 0 0 14px;
      padding: 13px 16px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.6;
    }
    .skn-msg-bot {
      border: 1px solid rgba(212, 178, 90, 0.25);
      border-bottom-left-radius: 4px;
      background: rgba(35, 14, 24, 0.85);
      color: #f4ece2;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    .skn-msg-user {
      margin-left: auto;
      border-bottom-right-radius: 4px;
      background: linear-gradient(135deg, #6b1d32, #8e213e);
      color: #ffffff;
      border: 1px solid rgba(212, 178, 90, 0.3);
    }
    .skn-concierge-quick {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 10px 20px 14px;
      scrollbar-width: none;
      background: #140710;
      border-top: 1px solid rgba(212, 178, 90, 0.15);
    }
    .skn-concierge-quick button {
      flex: 0 0 auto;
      border: 1px solid rgba(212, 178, 90, 0.35);
      border-radius: 999px;
      background: rgba(45, 17, 30, 0.6);
      color: #d4b25a;
      padding: 7px 12px;
      font-size: 11px;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s;
    }
    .skn-concierge-quick button:hover {
      background: #d4b25a;
      color: #1c0d16;
    }
    .skn-concierge-form {
      display: flex;
      gap: 8px;
      padding: 14px 18px;
      border-top: 1px solid rgba(212, 178, 90, 0.2);
      background: #190a14;
    }
    .skn-concierge-form input {
      min-width: 0;
      flex: 1;
      border: 1px solid rgba(212, 178, 90, 0.3);
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.4);
      padding: 11px 16px;
      color: #f4ece2;
      font-size: 13px;
      outline: none;
    }
    .skn-concierge-form input:focus {
      border-color: #d4b25a;
      box-shadow: 0 0 0 3px rgba(212, 178, 90, 0.2);
    }
    .skn-concierge-send {
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, #d4b25a, #c09d43);
      color: #14060e;
      font-weight: 600;
      padding: 0 18px;
      cursor: pointer;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: transform 0.2s;
    }
    .skn-concierge-send:hover {
      transform: scale(1.04);
    }
    .skn-concierge-wa {
      display: block;
      margin: 0 18px 16px;
      border-radius: 999px;
      background: linear-gradient(135deg, #591a2a, #781c34);
      color: #f4ece2;
      border: 1px solid rgba(212, 178, 90, 0.4);
      padding: 11px 16px;
      text-align: center;
      text-decoration: none;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    .skn-concierge-wa:hover {
      background: #d4b25a;
      color: #14060e;
      border-color: #d4b25a;
    }
    @media(max-width: 620px) {
      .skn-concierge-panel {
        inset: 12px;
        width: auto;
        height: calc(100svh - 24px);
        border-radius: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement("div");
  backdrop.className = "skn-concierge-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const panel = document.createElement("section");
  panel.className = "skn-concierge-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "SK Nanda concierge");
  panel.innerHTML = `
    <header class="skn-concierge-head">
      <p class="skn-concierge-kicker">SK Nanda F&amp;B · Private Concierge</p>
      <h2 class="skn-concierge-title">Your Culinary Concierge</h2>
      <p class="skn-concierge-status">Inquire about Manan, Pratik, menus, live stations, or wedding curation.</p>
      <button class="skn-concierge-close" type="button" aria-label="Close concierge">✕</button>
    </header>
    <div class="skn-concierge-messages" aria-live="polite">
      <div class="skn-msg skn-msg-bot">Welcome to SK Nanda F&amp;B. I am your private culinary concierge. You can ask me about our founders (Mr. S.K. Nanda, Pratik Nanda, Manan Nanda), our 22+ theatrical live stations, destination weddings, or full bespoke menus. How may I assist you today?</div>
    </div>
    <div class="skn-concierge-quick" aria-label="Suggested questions">
      <button type="button" data-prompt="Who is Manan Nanda?">Who is Manan?</button>
      <button type="button" data-prompt="Who is Pratik Nanda?">Who is Pratik?</button>
      <button type="button" data-prompt="Explore full menu options">Full Menu</button>
      <button type="button" data-prompt="What live stations do you offer?">22 Live Stations</button>
      <button type="button" data-prompt="Plan a destination wedding">Destination Wedding</button>
    </div>
    <form class="skn-concierge-form">
      <input aria-label="Message" placeholder="Ask about Manan, live stations, menus…" autocomplete="off" />
      <button class="skn-concierge-send" type="submit">Send</button>
    </form>
    <a class="skn-concierge-wa" target="_blank" rel="noopener" href="https://wa.me/${PHONE}?text=${encodeURIComponent("Hello SK Nanda F&B, I would like personal assistance planning an event.")}">Speak Directly With The Directors on WhatsApp</a>
  `;
  document.body.append(backdrop, panel);

  const messages = panel.querySelector(".skn-concierge-messages");
  const form = panel.querySelector("form");
  const input = panel.querySelector("input");
  const closeButton = panel.querySelector(".skn-concierge-close");
  let previousFocus = null;

  const chatHistory = [];

  function addMessage(text, kind) {
    const message = document.createElement("div");
    message.className = `skn-msg skn-msg-${kind}`;
    message.innerHTML = escapeHtml(text);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  async function ask(text) {
    const value = text.trim();
    if (!value) return;
    addMessage(value, "user");
    chatHistory.push({ role: "user", content: value });
    input.value = "";

    // Show luxurious typing placeholder
    const typingIndicator = addMessage("Consulting royal culinary concierge…", "bot");
    typingIndicator.style.opacity = "0.75";
    typingIndicator.style.fontStyle = "italic";

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          history: chatHistory.slice(-8)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          typingIndicator.remove();
          addMessage(data.reply, "bot");
          chatHistory.push({ role: "model", content: data.reply });
          return;
        }
      }
    } catch (e) {
      // Background fallback to offline knowledge base
    }

    typingIndicator.remove();
    const fallbackAnswer = findAnswer(value);
    addMessage(fallbackAnswer, "bot");
    chatHistory.push({ role: "model", content: fallbackAnswer });
  }

  function open() {
    previousFocus = document.activeElement;
    document.documentElement.classList.add("skn-concierge-open");
    window.setTimeout(() => input.focus(), 220);
  }

  function close() {
    document.documentElement.classList.remove("skn-concierge-open");
    previousFocus?.focus?.();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
  });

  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  panel.querySelectorAll(".skn-concierge-quick button").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.getAttribute("data-prompt") || button.textContent;
      ask(prompt);
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.documentElement.classList.contains("skn-concierge-open")) {
      close();
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof Element && target.closest("[data-concierge-open]")) {
      e.preventDefault();
      open();
    }
  });
})();
