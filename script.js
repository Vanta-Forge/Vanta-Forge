document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");

    // Non-blocking Service Worker cleanup
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
        }).catch(() => {});
    }

    const fetchNoCache = async (url) => {
        const res = await fetch(`${url}?v=${Date.now()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-store, no-cache" }
        });
        return res.json();
    };

    try {
        // 1. Instant Render: Hero background uses root 'pic.jpg' directly for maximum speed
        const heroSection = document.createElement("section");
        heroSection.className = "hero-section";
        heroSection.style.setProperty('--hero-bg', `url('pic.jpg?v=${Date.now()}')`);

        const heroOverlay = document.createElement("div");
        heroOverlay.className = "hero-overlay";

        const heroContent = document.createElement("div");
        heroContent.className = "hero-content";

        const heroTitle = document.createElement("h1");
        heroTitle.className = "hero-title";
        heroTitle.textContent = "Vanta Forge";

        const scrollBtn = document.createElement("button");
        scrollBtn.className = "scroll-btn";
        scrollBtn.innerHTML = `Scroll Down <span>&darr;</span>`;
        scrollBtn.addEventListener("click", () => {
            document.getElementById("page2").scrollIntoView({ behavior: "smooth" });
        });

        heroContent.appendChild(heroTitle);
        heroContent.appendChild(scrollBtn);
        heroSection.appendChild(heroOverlay);
        heroSection.appendChild(heroContent);
        app.appendChild(heroSection);

        // Build Page 2 Container
        const contentSection = document.createElement("section");
        contentSection.id = "page2";
        contentSection.className = "content-section";

        const introText = document.createElement("div");
        introText.className = "intro-text";
        introText.textContent = "We know that you here means you in hurry, but you have to control your emotions, you are at the right place right now if you are reading this take a few minutes and invest in this site.";
        contentSection.appendChild(introText);

        const dropdownContainer = document.createElement("div");
        dropdownContainer.className = "dropdown-container";
        contentSection.appendChild(dropdownContainer);
        app.appendChild(contentSection);

        const createAccordion = (title, contentBuilder) => {
            const item = document.createElement("div");
            item.className = "accordion-item";

            const header = document.createElement("button");
            header.className = "accordion-header";
            header.innerHTML = `<span>${title}</span> <span class="accordion-icon">&#9660;</span>`;

            const body = document.createElement("div");
            body.className = "accordion-body";
            contentBuilder(body);

            header.addEventListener("click", () => {
                item.classList.toggle("active");
            });

            item.appendChild(header);
            item.appendChild(body);
            return item;
        };

        // Fetch overview data instantly
        const overviewData = await fetchNoCache("overview.json");
        const overviewAccordion = createAccordion("1) Overview", (bodyContainer) => {
            const wrapper = document.createElement("div");
            wrapper.className = "overview-content";
            overviewData.paragraphs.forEach(text => {
                const p = document.createElement("p");
                p.textContent = text;
                wrapper.appendChild(p);
            });
            bodyContainer.appendChild(wrapper);
        });
        dropdownContainer.appendChild(overviewAccordion);

        // 2. Lazy load FAQs and registration form post-paint
        setTimeout(async () => {
            try {
                const faqData = await fetchNoCache("faq.json");

                // FAQs
                const faqAccordion = createAccordion("2) FAQs", (bodyContainer) => {
                    const wrapper = document.createElement("div");
                    faqData.faqs.forEach(faq => {
                        const faqItem = document.createElement("div");
                        faqItem.className = "faq-item";
                        const q = document.createElement("div");
                        q.className = "faq-question";
                        q.textContent = faq.question;
                        const a = document.createElement("div");
                        a.className = "faq-answer";
                        a.textContent = faq.answer;
                        faqItem.appendChild(q);
                        faqItem.appendChild(a);
                        wrapper.appendChild(faqItem);
                    });
                    bodyContainer.appendChild(wrapper);
                });
                dropdownContainer.appendChild(faqAccordion);

                // Community Hub
                const communityAccordion = createAccordion("3) Community Hub", (bodyContainer) => {
                    const wrapper = document.createElement("div");
                    const p = document.createElement("p");
                    p.textContent = "Explore our community hub, client reviews, and active stores built for free.";
                    const btn = document.createElement("button");
                    btn.className = "action-btn";
                    btn.textContent = "Let's go to reviews";
                    btn.addEventListener("click", () => {
                        window.location.href = "community/";
                    });
                    wrapper.appendChild(p);
                    wrapper.appendChild(btn);
                    bodyContainer.appendChild(wrapper);
                });
                dropdownContainer.appendChild(communityAccordion);

                // ============================================================
                // 4) BOOK A FREE SEAT - UPDATED (Removed Input Fields)
                // ============================================================
                const bookAccordion = createAccordion("4) Book A Free Seat and Solve Your Problem", (bodyContainer) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "regis-form-wrapper";

                    const infoP = document.createElement("p");
                    infoP.textContent = `Click the button below to open the registration form. You will be redirected to a secure Google Form to fill in your details.`;
                    wrapper.appendChild(infoP);

                    const actionBtn = document.createElement("button");
                    actionBtn.className = "action-btn regis-submit-btn";
                    actionBtn.textContent = "Register now";
                    
                    actionBtn.addEventListener("click", () => {
                        // Open the Google Form in a new tab
                        window.open("https://forms.gle/N4EBLUZLbUZUvQsm9", "_blank");

                        // Give visual feedback that the form opened
                        actionBtn.textContent = "✓ Form Opened";
                        actionBtn.style.background = "linear-gradient(135deg, #238636, #2ea043)";
                        actionBtn.disabled = true;

                        // Reset the button after 5 seconds so they can click again if needed
                        setTimeout(() => {
                            actionBtn.textContent = "Register now";
                            actionBtn.style.background = "";
                            actionBtn.disabled = false;
                        }, 5000);
                    });

                    wrapper.appendChild(actionBtn);
                    bodyContainer.appendChild(wrapper);
                });
                dropdownContainer.appendChild(bookAccordion);

            } catch (err) {
                console.error("Lazy load error:", err);
            }
        }, 50);

    } catch (error) {
        console.error("Critical error:", error);
    }
});