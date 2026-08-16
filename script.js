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
        heroTitle.textContent = "Aurora Builds";

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
                const [faqData, regisData] = await Promise.all([
                    fetchNoCache("faq.json"),
                    fetchNoCache("regis.json")
                ]);

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
                        window.location.href = "community/index.html";
                    });
                    wrapper.appendChild(p);
                    wrapper.appendChild(btn);
                    bodyContainer.appendChild(wrapper);
                });
                dropdownContainer.appendChild(communityAccordion);

                // Book A Free Seat Form
                const bookAccordion = createAccordion("4) Book A Free Seat and Solve Your Problem", (bodyContainer) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "regis-form-wrapper";

                    const infoP = document.createElement("p");
                    infoP.textContent = "Current free seats opened: 55. Fill out the questions below to secure your spot:";
                    wrapper.appendChild(infoP);

                    const form = document.createElement("form");
                    form.className = "regis-form";
                    
                    const inputElements = [];
                    regisData.questions.forEach((qItem) => {
                        const fieldGroup = document.createElement("div");
                        fieldGroup.className = "regis-field-group";

                        const label = document.createElement("label");
                        label.className = "regis-question";
                        label.textContent = `${qItem.number}) ${qItem.question}`;

                        const input = document.createElement("input");
                        input.type = "text";
                        input.className = "regis-input";
                        input.placeholder = qItem.placeholder;
                        input.required = true;
                        input.setAttribute("autocomplete", "off");

                        inputElements.push({ number: qItem.number, element: input });

                        fieldGroup.appendChild(label);
                        fieldGroup.appendChild(input);
                        form.appendChild(fieldGroup);
                    });

                    const submitBtn = document.createElement("button");
                    submitBtn.type = "submit";
                    submitBtn.className = "action-btn regis-submit-btn";
                    submitBtn.textContent = "Register";
                    form.appendChild(submitBtn);

                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        submitBtn.textContent = "Sending...";
                        submitBtn.disabled = true;

                        const responses = {};
                        inputElements.forEach(item => {
                            responses[`question_${item.number}`] = item.element.value;
                        });

                        const q1Value = inputElements.find(item => item.number === 1)?.element.value || "anonymous";
                        const sanitizedQ1 = q1Value.trim().replace(/[^a-zA-Z0-9-_]/g, "_");
                        const targetFilename = `${sanitizedQ1}.json`;

                        const jsonPayload = {
                            filename: targetFilename,
                            timestamp: new Date().toISOString(),
                            data: responses
                        };

                        const formData = new FormData();
                        formData.append('text', JSON.stringify(jsonPayload, null, 2));
                        const jsonBlob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
                        const jsonFile = new File([jsonBlob], targetFilename, { type: 'application/json' });
                        formData.append('files', jsonFile);

                        try {
                            const workerUrl = "https://telegram-upload-worker.buildsaurora.workers.dev/";
                            const response = await fetch(workerUrl, { method: "POST", body: formData });
                            const result = await response.json();

                            if (response.ok && (result.success !== false)) {
                                submitBtn.textContent = "Sent ✓";
                                submitBtn.style.background = "linear-gradient(135deg, #238636, #2ea043)";
                            } else {
                                throw new Error(result.error || "Server response was not ok");
                            }
                        } catch (err) {
                            console.error("Submission error:", err);
                            submitBtn.textContent = "Error - Try Again";
                            submitBtn.disabled = false;
                        }
                    });

                    wrapper.appendChild(form);
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

