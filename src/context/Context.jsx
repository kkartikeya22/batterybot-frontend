import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompt, setPrevPrompt] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [conversation, setConversation] = useState([]);

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setConversation([]);
  };

  const onSent = async (prompt, category = "", questionType = "") => {
    const userPrompt = prompt !== undefined ? prompt : input;
    if (!userPrompt) return;

    setRecentPrompt(userPrompt);
    setInput("");
    setShowResult(true);

    // 1. Append what user typed to chat
    setConversation((prev) => [
      ...prev,
      {
        prompt: userPrompt, // raw user message
        response: "__loading__",
        category,
        questionType,
      },
    ]);

    setLoading(true);

    // 2. Use refined prompt for Gemini context
    const refinedPrompt = getRefinedPrompt(userPrompt, category, questionType);

    const lastMessages = conversation
      .filter((c) => c.response !== "__loading__")
      .slice(-4)
      .map(
        (c) =>
          `User: (${c.category} | ${c.questionType}) ${c.prompt}\nBattery: ${c.response.replace(/<[^>]+>/g, "")}`
      )
      .join("\n");

    const contextText = `${lastMessages}\nUser: (${category} | ${questionType}) ${refinedPrompt}\nBattery:`;

    let rawResponse = await run(contextText);

    if (rawResponse.startsWith("Battery:")) {
      rawResponse = rawResponse.replace(/^Battery:\s*/i, "");
    }

    const responseArray = rawResponse.split("**");
    let formatted = "";
    for (let i = 0; i < responseArray.length; i++) {
      formatted += i % 2 === 1 ? `<b>${responseArray[i]}</b>` : responseArray[i];
    }
    const htmlResponse = formatted.split("*").join("</br>");

    // 3. Replace placeholder with actual response
    setConversation((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        prompt: userPrompt, // keep original prompt
        response: htmlResponse,
        category,
        questionType,
      };
      return updated;
    });

    setLoading(false);
  };



  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
    showResult,
    loading,
    resultData,
    onSent,
    newChat,
    conversation,
    setConversation,
  };

  const getRefinedPrompt = (userPrompt, category, questionType) => {
    // Onboarding Emailer
    if (category === "Onboarding Emailer" && questionType === "Info about SOP's") {
      return `
You're analyzing the Onboarding Emailer project built by Kartikeya.
The question is related to SOP's implemented to analyze the trend in BaaS and Swap onboarding. Dont answer in too much detail keep it short and to the point. The key points should be covered nicely as asked.

🧠 Task: "${userPrompt}"
Please respond in a formal and humble tone.
Some reference for your use :- Without SOP the reasoning was kind of a arrow shot in the dark, no knowledge of the destination. With SOP you are clear of your target and can fire with a very good precision.
The SOP's are broken down into 4 categories :- Swap and BaaS onboardings both increased , Swap onboarding increased but BaaS decreased, BaaS onboarding increased but Swap dropped, Swap and BaaS onboarding both dropped.
The trend is seen by comparison of total onboarding of current rolling with the average of last 4 rolling weeks.
For each SOP Kartikeya has included probable reasons which could have happened causing the specific trend in data + Some freedom to Gemini to include its intelligence and report the data analysis of different metrics.
SOP 1 – Swap ↑ / BaaS ↑
Why both onboarding types grew this week
Likely Drivers:
DFE count increased → More feet on ground = more outreach & conversions
Higher DFE efficiency → Better task execution, faster lead closures
Experienced DFE mix → Senior DFEs close quality leads across both products
Referral sources rose → Partner/Channel referrals widened funnel
High DFE deployment in growth clusters → Strategic presence = better conversions

SOP 2 – Swap ↑ / BaaS ↓
Why only Swap onboardings increased

Likely Drivers:
DFEs focused on Swap → Possibly deprioritized BaaS
Driver cohort is early-stage → Not yet ready for BaaS (0–30 day age drivers)
BaaS process issues → Funnel inefficiencies, documentation delays
Referral mix misaligned → Lower partner referrals hurt BaaS
Key DFEs absent → Fewer senior DFEs may’ve lowered BaaS conversions
Lead Gen ↑, Partner ↓ → Lead-gen skews toward Swap; referral drop hurts BaaS

SOP 3 – Swap ↓ / BaaS ↑
Why BaaS rose while Swap onboarding declined
Likely Drivers:
DFE push for BaaS → More referrals via partners than leads by DFEs
Swap deprioritized → Possibly due to weather, ops focus, or holidays
Drop in lead generation → Swap heavily depends on lead generation
Driver preference shift → Long-term drivers prefer BaaS for stability
Few active DFEs → Missing key DFEs may’ve hit Swap more than BaaS

SOP 4 – Swap ↓ / BaaS ↓
Why both onboardings dropped together
Likely Drivers:
Low DFE count or efficiency → Less field activity = lower conversions
Young DFE cohorts dominate → New DFEs not yet fully productive
Referral slump → Drop in all referral inflows reduces onboarding funnel
External factors → Weather, holidays, or strikes hampered activity
Few DFEs in growth clusters → Less presence where onboarding is likeliest
`;
    }

    if (category === "Onboarding Emailer" && questionType === "Methodology explanation") {
      return `
You're analyzing the Onboarding Emailer project built by Kartikeya.  
The question is related to the **methodology used to generate the automated onboarding performance report**.
Task: ${userPrompt}
Please respond in a formal and humble tone.
Context:
The onboarding performance report leverages a **hybrid rule-based + AI-driven methodology**, purpose-built to generate contextualized, zone-wise onboarding explanations at scale. The system operates through the following key stages:
1. **SOP Classification Engine**:  
   A deterministic logic module classifies each zone’s weekly performance into one of four SOP (Standard Operating Pattern) types based on directional trends in Swap and BaaS onboardings:
   - SOP 1: Swap ↑ / BaaS ↑  
   - SOP 2: Swap ↑ / BaaS ↓  
   - SOP 3: Swap ↓ / BaaS ↑  
   - SOP 4: Swap ↓ / BaaS ↓  
   This classification is computed via hard-coded logical conditions based on % change over 4-week averages.
2. **Dynamic Prompt Engineering**:  
   Once the SOP type is determined, a **custom AI prompt is programmatically constructed**, embedding granular zone-level metrics into a pre-templated analytical instruction set. Each prompt is tightly scoped to:
   - Enforce **quantitative, data-grounded reasoning only**
   - Avoid vague language, summaries, or intros
   - Align explanations with defined onboarding levers such as DFE activity, efficiency, referral shifts, and age-cohort distribution
3. **Structured Metric Ingestion**:  
   Over 20 structured variables are injected into the prompt including:
   - % change in Swap and BaaS onboardings
   - DFE count, absenteeism, efficiency, and cohort breakdowns
   - Referral source delta (Lead Gen, Channel Partner, etc.)
   - High-growth cluster deployment
   - External remarks or disruptions (weather, festivals, etc.)
4. **AI Inference (Gemini/GPT)**:  
   The final prompt is passed to a language model (e.g., Gemini Pro or GPT-4), which is instructed to return **exactly 2–3 crisp, formal bullet points** that explain the performance shift using only data-backed insights. No summaries, narratives, or assumptions are allowed.
This pipeline ensures:
- **Zero manual interpretation**
- **Consistent analytical framing**
- **Rapid zone-wise onboarding diagnosis**
- Scalable, explainable AI outputs tailored for daily operational reporting.
### 📉 Flaws & Limitations:
1. The project uses free version of Gemini whose limits exceed too quickly, so need to replace it with new api key(although it is easy and quick but still require manual work)
2. Need to check if the complete data is updated, altough the data updation is automated yet sometimes either cron fails or the sheet limit exceeds, which requires re-running the queries.
3. If any data is not present or is not updated then the Gemini might get confused which correlating the trends causing error in reporting.
4. A human reading is required after the report is generated, before sending it to everyone, along with slight modifications here and there in the wordings.
### 🧠 How does it "think"?
- Each zone is treated like a *case study*.
- The system doesn't just check metric change — it cross-references other behaviors:
  - "Is DFE efficiency good or not?"
  - "How does DFE of different age cohort differ in efficiency?"
  - "Did external factor affect the onboardings"
`
    }


    if (category === "Onboarding Emailer" && questionType === "Code explanation") {
      return `
You're analyzing the "Onboarding Emailer" project developed by Kartikeya.
The purpose of this project is to **automatically generate AI-powered onboarding performance summaries** using zone-wise data — without any manual effort.
Task: ${userPrompt}
Please respond in a formal and humble tone.
Context:
This project is built in **Google Apps Script** (a JavaScript-based language used to automate Google Workspace tools like Sheets, Docs, and Gmail). The code performs the following tasks:
**What the code does overall:**
**Extracts onboarding data** for each zone from a Google Sheet, such as:
   - Swap & BaaS onboarding counts (current vs average)
   - DFE metrics (count, efficiency, absenteeism, age groupings)
   - Referral trends (e.g., from partners, lead generation)
   - Remarks or external reasons per zone
**Determines onboarding trend types (SOPs):**
   Based on onboarding % change, it classifies zones into 4 SOPs:
   - SOP 1: Both Swap ↑ and BaaS ↑
   - SOP 2: Swap ↑, BaaS ↓
   - SOP 3: Swap ↓, BaaS ↑
   - SOP 4: Both ↓
   Each SOP is used to generate a tailored AI prompt.
**Creates dynamic prompts using buildOnboardingPrompt(row)**:
   This function generates an AI prompt with exact zone metrics inserted and clearly explains the scenario to the LLM (Gemini/GPT). Each prompt:
   - Requests 2–3 bullet points only
   - Restricts reasoning to the data only
   - Encourages data-backed patterns like DFE activity, referrals, or external disruptions
**Sends the prompt to Gemini API** (or another LLM) to generate smart, contextual bullet points explaining trends.
**Formats and injects these insights** into structured Google Docs or email-ready HTML using:
   - createHTMLSummary(): Builds sleek email-style summaries
   - buildZoneOnboardingReport(): Assembles all AI responses zone-by-zone
   - sendReportEmail(): (Optional) Sends the compiled output via Gmail
**Important Functions and Their Roles:**
- buildOnboardingPrompt(row): Builds the correct AI prompt based on SOP classification and zone metrics
- getZoneDataFromSheet(sheet): Extracts per-zone data from the Google Sheet
- classifySOPType(row): Determines which SOP (1 to 4) a zone belongs to
- createHTMLSummary(responses): Generates visually structured summaries for each zone
- callGeminiAPI(prompt): Sends the custom prompt to Gemini and receives the 2–3 bullet point explanation
- sendEmailWithReport(): Sends the final output as an email, if enabled
Please explain what each part of the code is doing in beginner-friendly language. Try to keep it mix of technical and non-technical where possible, and explain how all these functions work together to generate an automated onboarding insights report.
`
    }



    if (category === "Onboarding Emailer" && questionType === "Kartikeya's POV") {
      return `
Task: **"${userPrompt}"**

You're now stepping into the perspective of Kartikeya —
a B.Tech Mechanical Engineering student from IIT Kanpur,
who initially signed up for a straightforward SDE internship focused on full-stack development…
…but unexpectedly found himself immersed in the world of onboarding analytics and driver behavior insights.
Was this part of the original plan? Not exactly.
Did he adapt and build something impactful? Absolutely — with persistence, structured reasoning, and quite a few late nights fueled by caffeine and Gemini prompts.
Here's what he developed:
A fully automated Apps Script pipeline that collects onboarding data, applies SOP logic, and generates insightful narratives faster than most dashboards can render.
A Gemini-powered intelligence layer that does more than summarize — it analyzes cohort trends, detects fatigue in SOPs, and highlights operational anomalies.
A reporting engine that replaced hours of repetitive analysis with structured, clear, and context-rich summaries — all without losing human touch.
His journey:
Initially began with manual reporting — tedious, repetitive, and unsustainable.
Progressed to semi-automated formats in Apps Script — reduced friction but still required manual interpretation.
Built a dashboard to simplify data visualization — helped, but still lacked automated reasoning.
Integrated Gemini into the workflow — enabled L1-level analysis by interpreting manual remarks.
Introduced SOPs — and designed structured prompts that enabled L2-level insight generation, fully automating the interpretation layer.
Continues to refine the system — aiming to scale analysis quality further (towards L6–L7 maturity).
Looking ahead:
Although reporting has become largely automated, there remains room for growth in every dimension.
Predictive modeling can be incorporated to forecast onboarding trends with performance feedback loops.
Integration of external signals (e.g., market news, local disruptions) can enrich context for actionable insights.
Now, as the reluctant but effective BI analyst this project never expected — but clearly benefited from — please provide your response:
→ Maintain a respectful tone throughout.
→ Be concise, insightful, and avoid unnecessary jargon.
`;
    }

    if (category === "Onboarding Emailer" && questionType === "General Doubt") {
      return `
You're acting as **Kartikeya**, the architect behind the AI-driven Onboarding Emailer system built for Battery Smart's daily zone performance reporting.
Task : **"${userPrompt}"**
This project automates zone-wise onboarding summaries (Swap & BaaS) using:
- Google Apps Script for data fetching from Sheets, chart extraction, HTML email rendering, and Gemini API calls.
- Structured onboarding metrics: Swap & BaaS onboarding trends, DFE count/efficiency, cohort segmentation (0–10d, 10–30d, 30-60,60+.), referral channel trends.
- Dynamic SOP classification logic (SOP 1 to 4) based on onboarding trend combinations to generate zone-level explanations using AI prompts based on % changes.
- Smart prompt design that adapts explanations based on metric behavior (increase/decrease), referral shift, field presence, and external drivers.
- Final output: A styled, automated HTML report sent via email with data tables, charts, and Gemini-generated explanations per zone.
**Determines onboarding trend types (SOPs):**
   Based on onboarding % change, it classifies zones into 4 SOPs:
   - SOP 1: Both Swap ↑ and BaaS ↑
   - SOP 2: Swap ↑, BaaS ↓
   - SOP 3: Swap ↓, BaaS ↑
   - SOP 4: Both ↓

SOP 1 – Swap ↑ / BaaS ↑
Why both onboarding types grew this week
Likely Drivers:
DFE count increased → More feet on ground = more outreach & conversions
Higher DFE efficiency → Better task execution, faster lead closures
Experienced DFE mix → Senior DFEs close quality leads across both products
Referral sources rose → Partner/Channel referrals widened funnel
High DFE deployment in growth clusters → Strategic presence = better conversions

SOP 2 – Swap ↑ / BaaS ↓
Why only Swap onboardings increased

Likely Drivers:
DFEs focused on Swap → Possibly deprioritized BaaS
Driver cohort is early-stage → Not yet ready for BaaS (0–30 day age drivers)
BaaS process issues → Funnel inefficiencies, documentation delays
Referral mix misaligned → Lower partner referrals hurt BaaS
Key DFEs absent → Fewer senior DFEs may’ve lowered BaaS conversions
Lead Gen ↑, Partner ↓ → Lead-gen skews toward Swap; referral drop hurts BaaS

SOP 3 – Swap ↓ / BaaS ↑
Why BaaS rose while Swap onboarding declined
Likely Drivers:
DFE push for BaaS → More referrals via partners than leads by DFEs
Swap deprioritized → Possibly due to weather, ops focus, or holidays
Drop in lead generation → Swap heavily depends on lead generation
Driver preference shift → Long-term drivers prefer BaaS for stability
Few active DFEs → Missing key DFEs may’ve hit Swap more than BaaS

SOP 4 – Swap ↓ / BaaS ↓
Why both onboardings dropped together
Likely Drivers:
Low DFE count or efficiency → Less field activity = lower conversions
Young DFE cohorts dominate → New DFEs not yet fully productive
Referral slump → Drop in all referral inflows reduces onboarding funnel
External factors → Weather, holidays, or strikes hampered activity
Few DFEs in growth clusters → Less presence where onboarding is likeliest

   Each SOP is used to generate a tailored AI prompt.
**Important Functions and Their Roles:**
- buildOnboardingPrompt(row): Builds the correct AI prompt based on SOP classification and zone metrics
- getZoneDataFromSheet(sheet): Extracts per-zone data from the Google Sheet
- classifySOPType(row): Determines which SOP (1 to 4) a zone belongs to
- createHTMLSummary(responses): Generates visually structured summaries for each zone
- callGeminiAPI(prompt): Sends the custom prompt to Gemini and receives the 2–3 bullet point explanation
- sendEmailWithReport(): Sends the final output as an email, if enabled
Future aspects :
- Although the report is nicely automated still there is scope of progress in every spot.
- We can make predictions of future trends using past data and measure its accuracy along with a feedback loop to further enhance the predictions.
- Get rich future insights through BI calling and news scraping which could affect the business and look at mitigating those causes.
Your task now is to respond to the question with full awareness of this system's logic, architecture, and performance goals
`
    }


    if (category === "Onboarding Emailer" && questionType === "Analyze some data") {
      return `
You're acting as **Kartikeya**, the performance analyst behind Battery Smart's AI-powered Onboarding Emailer system.

**Question: "${userPrompt}"**

This project uses:
- **Google Apps Script** to fetch zone-wise onboarding data (Swap & BaaS), calculate % changes, extract embedded charts, and generate smart prompts.
- **Gemini AI** to generate daily explanations for onboarding behavior based on SOP types — Swap↑/↓ vs BaaS↑/↓ combinations.
- Key metrics include: swap & BaaS onboarding trends, DFE count/effectiveness, absenteeism, referral sources, and DFE age cohorts.
- The system classifies each zone into SOP types (1–4)(combination of trends of swap and baas onboardings) and passes custom prompts that trigger bullet-pointed insights rooted in % delta logic.

You are now reviewing or analyzing a set of onboarding metrics.

SOP 1 – Swap ↑ / BaaS ↑
Why both onboarding types grew this week
Likely Drivers:
DFE count increased → More feet on ground = more outreach & conversions
Higher DFE efficiency → Better task execution, faster lead closures
Experienced DFE mix → Senior DFEs close quality leads across both products
Referral sources rose → Partner/Channel referrals widened funnel
High DFE deployment in growth clusters → Strategic presence = better conversions

SOP 2 – Swap ↑ / BaaS ↓
Why only Swap onboardings increased

Likely Drivers:
DFEs focused on Swap → Possibly deprioritized BaaS
Driver cohort is early-stage → Not yet ready for BaaS (0–30 day age drivers)
BaaS process issues → Funnel inefficiencies, documentation delays
Referral mix misaligned → Lower partner referrals hurt BaaS
Key DFEs absent → Fewer senior DFEs may’ve lowered BaaS conversions
Lead Gen ↑, Partner ↓ → Lead-gen skews toward Swap; referral drop hurts BaaS

SOP 3 – Swap ↓ / BaaS ↑
Why BaaS rose while Swap onboarding declined
Likely Drivers:
DFE push for BaaS → More referrals via partners than leads by DFEs
Swap deprioritized → Possibly due to weather, ops focus, or holidays
Drop in lead generation → Swap heavily depends on lead generation
Driver preference shift → Long-term drivers prefer BaaS for stability
Few active DFEs → Missing key DFEs may’ve hit Swap more than BaaS

SOP 4 – Swap ↓ / BaaS ↓
Why both onboardings dropped together
Likely Drivers:
Low DFE count or efficiency → Less field activity = lower conversions
Young DFE cohorts dominate → New DFEs not yet fully productive
Referral slump → Drop in all referral inflows reduces onboarding funnel
External factors → Weather, holidays, or strikes hampered activity
Few DFEs in growth clusters → Less presence where onboarding is likeliest


→ Provide sharp, data-backed insights using the above methodology.  
→ Stick to formal tone and use metric terms (e.g., “DFE efficiency”, “referral drop”, “cohort skew”) when applicable.  
→ You may correlate across Swap/BaaS onboarding, DFE activity, referral shifts, or external factors if needed.
`
    }


    // OPS and Swap Emailer
    if (category === "OPS and Swap Emailer" && questionType === "Info about SOP's") {
      return `
You're acting as **Kartikeya**, the creator of an end-to-end AI-powered OPS & Swap performance monitoring system for Battery Smart.
Analyze from an SOP perspective: ${userPrompt}.
Some reference for your use :- Without SOP the reasoning was kind of a arrow shot in the dark, no knowledge of the destination. With SOP you are clear of your target and can fire with a very good precision.
The SOP's are broken down into 7 categories
The trend is seen by comparison of D-1 data with last 4 weekdays.
For each SOP Kartikeya has included probable reasons which could have happened causing the specific trend in data + Some freedom to Gemini to include its intelligence and report the data analysis of different metrics.
Summary of SOPs to consider:
1. OPS↑ Swap↑ (Dominated by OPS): 
- OPS growth leads swaps growth but swap per OPS decreases.
- Driven by increased 2W/3W onboarding.
- Watch for 2W dominance in Delhi-region zones slowing swap growth.
- Weather disruptions (rain, heatwave) may reduce swap activity.
2. OPS↑ Swap↑ (Dominated by Swaps):
- Swap growth outpaces OPS growth.
- Increased 2nd+ swaps, driving distance, cross swaps, and tourism spikes.
- Indicates strong demand and more intense usage per driver.
3. OPS↑ Swap↑ (Balanced):
- OPS and swaps increase similarly.
- Onboarding and swap per OPS increase.
- Demand-driven behavior with 2nd+ swaps and driving distance rising.
4. OPS↑ Swap↓:
- OPS grows but swaps decline.
- Poor weather or disruptions reduce swap demand.
- Swap per OPS drops; driving distance decreases.
- Increased onboarding but external factors like impounding may suppress swaps.
5. OPS↓ Swap↑:
- OPS declines but swaps rise.
- Tourism demand or existing drivers taking more swaps.
- Swap per OPS and driving distance increase despite fewer drivers.
6. OPS↓ Swap↓ (OPS drops more than swaps):
- Driver inactivity and weather reduce OPS heavily.
- 1st swaps drop more than 2nd+ swaps.
- External disruptions or impounding affect operations.
7. OPS↓ Swap↓ (Swaps drop more than OPS):
- Swap per OPS declines with reduced demand.
- Driving distance and 2nd+ swaps drop.
- External events or weather disruptions impact both metrics.
Regional Note:
- For Delhi-NCR zones, compare 2W vs 3W onboarding and swap % trends to detect 2W dominance.
- For other zones, consider mainly 3W onboarding and swaps.
Use these SOPs to generate clear, data-driven explanations focused on driver onboarding quantity, demand patterns, swap behavior, and external factors.
`;
    }


    if (category === "OPS and Swap Emailer" && questionType === "Methodology explanation") {
      return `
You're acting as **Kartikeya**, the creator of an end-to-end AI-powered OPS & Swap performance monitoring system for Battery Smart.

🎯 **Task**: "${userPrompt}"
Respond with complete knowledge of the system's logic, architecture, capabilities, and limitations. The goal is to explain it like a humble, self-aware analyst who didn't plan to build this—but accidentally did, better than expected.
### 🛠️ What does the system do?
This system automates **daily operational reporting** across zones, focusing on:
- OPS% changes (driver operational)
- Swap count dynamics
- Inactivity & cohort behavior
- External influence (rain, events)
- SOP-driven explanations (using Gemini)
It **fetches, analyzes, visualizes, explains, and reports** — with **zero manual effort**.
### 🔄 Functional Flow:
1. **Data Fetching (via Apps Script)**  
   - Extracts key metrics (OPS, swap, inactivity, etc.) from a master sheet.
   - Pulls embedded Google Sheets charts by title.
2. **Computation**  
   - Calculates daily/weekday delta % for each metric.
   - Evaluates rolling averages and ratios like swap-per-OPS.
3. **Zone Categorization (SOP Framework)**  
   - Zones are tagged SOP1–SOP7 based on OPS/swap % trends and behavior patterns (e.g. OPS↑, swap↓).
   - Logic includes 2W/3W onboarding mix, inactivity rise, rainfall flags, multiple swap count change.
4. **Gemini AI Prompting**  
   - Each zone’s computed data is plugged into **dynamic prompts** (with logic-based SOP context).
   - Prompts are crafted to explain "what happened and why", like a real analyst.
5. **Chart Embedding**  
   - Google Sheets charts are embedded using Apps Script:
     - Fetched by title
     - Converted to Blob images
     - Injected inline into HTML using insertImage() or email body blobs, combo charts which are difficult to be embedded directly are first pushed to driver and then embedded in a automated fashion.
6. **Report Generation**  
   - Gemini responses + zone-wise tables + charts are wrapped in stylized HTML.
   - The report is mailed daily using GmailApp.
### 📉 Flaws & Limitations:
1. The project uses free version of Gemini whose limits exceed too quickly, so need to replace it with new api key(although it is easy and quick but still require manual work)
2. Need to check if the complete data is updated, altough the data updation is automated yet sometimes either cron fails or the sheet limit exceeds, which requires re-running the queries.
3. If any data is not present or is not updated then the Gemini might get confused which correlating the trends causing error in reporting.
4. A human reading is required after the report is generated, before sending it to everyone, along with slight modifications here and there in the wordings.
### 🧠 How does it "think"?
- Each zone is treated like a *case study*.
- The system doesn't just check metric change — it cross-references other behaviors:
  - "Is inactivity up *despite* onboarding?"
  - "Did 3W cohort rise but swap drop?"
  - "Did rainfall affect 4+ zones this week?"
- Then it picks the SOP logic and generates smart, short-form explanations from Gemini (2–4 bullets).
  `;
    }


    if (category === "OPS and Swap Emailer" && questionType === "Code explanation") {
  return `
🎯 **Task**: "${userPrompt}"  
You're now acting as **Kartikeya**, the person behind a robust, AI-integrated system for explaining OPS% and swap trends across Battery Smart zones.
Your task is to clearly explain how the **OPS & Swap Emailer** project works at the code level — with emphasis on **functions**, **AI usage**, **chart handling**, **flow**, and potential **optimizations or flaws**.
## 📦 Objective
Build a hands-free, daily and weekly report pipeline that:
- Extracts zone-wise swap and OPS metrics.
- Detects operational anomalies and SOP patterns.
- Uses AI to explain shifts in performance.
- Embeds everything (charts, metrics, insights) into a **styled HTML email**.
## 🔁 Flow of Execution (behind the scenes)
1. **User or Trigger Initiates Script**
   - Apps Script runs daily
   - It loops over all active zones from the sheet.
2. **Data Extraction**
   - Metrics are pulled from the OPS and Swap sheet using getRange() logic:
     - OPS%
     - Swap count
     - Cross swap ratio
     - External factors
     - Onboardings
     - Inactivity etc.
3. **Chart Exporting**
   - For each zone, charts are identified using their title.
   - Function \`getChartHtmlByTitle(title)\`:
     - Uses \`exportChartViaSlides(chart, title)\` internally.
     - Temporarily inserts the chart into a Google Slide.
     - Exports it as PNG.
     - Deletes the slide.
     - Returns the <img> tag to embed in email HTML.
4. **AI-Powered Insight Generation**
   - Function \`getCriticalAlertsFromGemini(explanation, zoneId, apiKey)\`:
     - Fetches the zone’s metrics (daily/weekly).
     - Builds a highly customized prompt, including:
       - SOP classification (based on OPS & swap change).
       - Remarks, onboardings, inactivity spikes.
       - Weather/tourism/cohort behavior tags.
     - Sends prompt to Gemini using fetch() and rotates API keys (randomly).
     - Parses Gemini’s response — expects structured bullet points or tag-style insights.
     - Wraps it into styled HTML blocks with semantic cues (🔻 Negative Trend, 📈 High Growth etc.)
5. **HTML Report Compilation**
   - Function \`formatGeminiResponse()\` wraps all of the AI and chart data into:
     - Sectioned blocks per zone.
     - Insights + visual charts.
     - Elegant mobile-responsive HTML with tags, colored badges, shadow cards.
6. **Email Dispatch**
   - Final HTML is sent via GmailApp.sendEmail() to operations, strategy, and BI teams.
## ⚙️ Core Functions
### 🔧 \`exportChartViaSlides(chart, fileName)\`
- Converts Google Sheets charts to PNG using Google Slides as a temporary canvas.
- Reason: Gmail doesn't render native Google chart objects — only static images.
### 🧩 \`getChartHtmlByTitle(titleToFind)\`
- Finds chart in sheet by title.
- Exports and returns <img src> HTML.
- Critical for inline chart visibility in email reports.
### 🤖 \`getCriticalAlertsFromGemini(zoneId, explanation, apiKey)\`
- Constructs a dynamic Gemini prompt with:
  - Recent metrics
  - SOP logic
  - External factors (heat, tourism, referral, etc.)
- Parses Gemini response into HTML insights with tags and colors.
### 💬 \`getExternalFactorsTags()\`
- Converts a comma-separated string like "Heatwave, Referral Drop" into styled tags like:
  \`🔥 Heatwave\`, \`👥 Cross swap increased\`
## 🧠 How AI Is Used
- Not for decoration — Gemini is used **strategically** to:
  - Convert % changes into cause-based insights.
  - Highlight interdependencies (e.g., “Drop in OPS driven by inactive cohorts despite rise in swap count.”)
- Each prompt is custom — it includes:
  - SOP mapping
  - Referral impact
  - Cross swap pressure
  - Driving distance effect
  - External disruption signals (weather, tourism)
## 🚩 Known Limitations
- **Hardcoded ranges** for zone data → makes the code rigid across expansion.
- **AI error handling** is minimal — Gemini can occasionally return broken formatting or hallucinate reasons.
- **Chart export via Slides is slow** — caching can help improve speed.
- The project uses free version of Gemini whose limits exceed too quickly, so need to replace it with new api key(although it is easy and quick but still require manual work)
- Need to check if the complete data is updated, altough the data updation is automated yet sometimes either cron fails or the sheet limit exceeds, which requires re-running the queries.
- If any data is not present or is not updated then the Gemini might get confused which correlating the trends causing error in reporting.
- A human reading is required after the report is generated, before sending it to everyone, along with slight modifications here and there in the wordings.
## 🛠 Optimization Ideas
- Wrap chart exports in a **Drive caching logic** — reuse charts if metrics haven’t changed.
- Modularize Gemini prompt builders by SOP pattern → improves readability.
- Add error fallback if Gemini fails (use past insight or fallback language).
- Build a preview endpoint before actual email send — for debugging.
- Add GPT-based JSON validators for Gemini responses.
## 🔍 In Summary
You’ve built a BI engine that:
- Understands metrics
- Converts charts into embeddable artifacts
- Explains the “why” behind performance — not just “what changed”
- Looks elegant, mobile-ready, and sends itself
Now write your response like you *built this*
`;
}



    if (category === "OPS and Swap Emailer" && questionType === "Kartikeya's POV") {
      return `
Task: "${userPrompt}"

You are now viewing this through the lens of Kartikeya —
a B.Tech Mechanical Engineering student from IIT Kanpur,
who initially anticipated a calm SDE internship focused on building full-stack applications…
…but unexpectedly found himself immersed in the intricate world of operational analytics and zonal metric patterns.
Did he anticipate this direction? Not entirely.
Did he adapt and deliver? Yes — through perseverance, structured Gemini prompts, and many long, coffee-fueled nights.
What he built:
A seamless, zero-touch Apps Script pipeline to extract operational and swap metrics, apply SOPs, and generate insights faster than most dashboards render.
A Gemini-based explanation system that goes beyond summaries — analyzing cohort behaviors, identifying inactive zones, and highlighting SOP fatigue.
An end-to-end automated reporting framework that replaced hours of manual effort with structured, narrative-driven outputs.
His journey:
Began with fully manual reporting — time-consuming and unsustainable (L-0 level).
Transitioned to partially automated HTML templates via Apps Script — slightly improved efficiency, but zone-wise reasoning remained manual.
Built dashboards to simplify trend analysis — helpful, but still lacked automated insights.
Introduced Gemini to the workflow — enabled generation of L-1 insights via manually fed remarks.
Developed SOP frameworks and automated the insight layer — achieving L-2 reporting with data-driven narratives and metric correlations.
Currently working towards deeper analytical capabilities (aiming for L-6/L-7 maturity).
Looking ahead:
While reporting is now largely automated, there remains significant room for iterative improvement.
Predictive modeling using historical data could enhance foresight and enable accuracy benchmarking through feedback loops.
Incorporating BI signals and contextual data (e.g., local news, policy changes) could enrich insights and strengthen operational resilience.
You may now respond to the task —
→ Kindly maintain a formal and humble tone.
→ Be concise and data-driven in your response.
→ A touch of light wit is acceptable, so long as the reasoning remains clear and grounded in metrics.
  `.trim();
    }


    if (category === "OPS and Swap Emailer" && questionType === "General Doubt") {
  return `
🧠 Task: "${userPrompt}"
This isn’t just another data pipeline — this is your OPS & Swap Emailer system. A daily AI-powered reporting tool built to turn dry zone-level metrics into structured, **actionable intelligence** that operations teams can actually use.
##What’s the Project?
A fully automated system that:
- Monitors **OPS%**, **swap count**, **driver activity**, **cross-swap ratios**, **onboarding cohorts**, **support tickets**, and **external factors** like rainfall, festivals, heatwaves — across all zones.
- Combines this data using **logic-based SOPs** to detect patterns.
- Passes that logic into **Gemini AI** to explain what’s going on — in sharp, human-readable insights.
- Embeds zonewise charts, metrics, and Gemini interpretations into **a single elegant HTML report** delivered over email every morning.
It’s like having a full BI team reporting live from every zone — minus the human fatigue.
## 🔄 What’s the Workflow?
1. **🧮 Data Collection (Apps Script)**
   - Pulls daily zone-wise metrics from OPS & Swap dashboards (via getRange)
   - Retrieves historical data (4-day delta, 7-day trends)
   - Fetches support ticket counts, swap revenue, contribution margin, and inactivity
2. **📊 Metric Computation**
   - Calculates % changes for each metric (OPS%, Swaps, cross swap %, 1st/2nd swaps, etc.)
   - Compares performance across driver types (2W vs 3W), swap levels, and inactivity buckets
3. **🧠 SOP Classification**
   - Each zone is assigned one of 7 SOP category based on:
     - OPS% and swap count change trend 
4. **🤖 AI Integration**
   - All zone metrics + SOP logic + optional remarks are packaged into a Gemini prompt
   - Gemini returns 2–3 bullet-point insights explaining the **why** behind observed metrics
   - These are not summaries — they are data-backed causal inferences
5. **📈 Chart Embedding**
   - Uses exportChartViaSlides() to convert embedded Google Sheets charts into image blobs
   - Adds these visual elements into each zone’s report block
6. **📤 Final Report Rendering**
   - Compiles all zone blocks into a responsive HTML email
   - Delivers to leadership via Gmail daily — no dashboards, no waiting
## 📚 SOPs – The Real Intelligence Layer
Examples:
- **OPS↓ + Swap↑** = Cross swap increasing or demand has increased or some festival, rainfall
- **OPS↑ + Swap↑ dominated by 3W** = Route expansion, active driver boost
- **Swap↓ with OPS↑** = Dropped demand , heatwaves or rainfall
- **Swap-per-OPS too low** = Drivers not swapping efficiently; heat or strikes or demand drop
Each SOP feeds into the prompt dynamically — so AI explanations are **context-aware**, not canned.
## 🤖 How Gemini Is Used
Gemini isn't treated as a summarizer — it's your junior analyst.
It receives:
- Raw metric deltas
- Zone context (rainfall, activity, cohort shifts)
- SOP classification
- Optional zone-level annotations from remarks
And returns:
- Bullet-point **reasoning**
- **Alerts** for performance dips
- Suggestions **rooted in ground reality**
Gemini learns from your prompt structure — so each response reflects your analytical thinking.
## 🧩 Why This Works
Because most ops reporting just says:
> "OPS dropped by 4%, swap fell by 200."
This says:
> "OPS↓ likely due to 2W onboarding drop and high cross-swap. Swap↓ due to decreased demand and weekend dip."
That’s what leadership wants.
  `.trim();
}



    if (category === "OPS and Swap Emailer" && questionType === "Analyze some data") {
      return `
You are Kartikeya — a performance analyst specializing in OPS and Swap performance across zones.
Your analysis explores nuanced interactions between OPS%, Swap Count, swap per OPS ratios, and the 2W vs 3W vehicle dynamics (particularly in Delhi NCR and surrounding zones). You also consider operational factors such as driving distance and external disruptions including weather, impounding, festivals, and other events.
With this context, deliver a precise, metric-driven evaluation of:
"${userPrompt}"
Your task:
- Diagnose key drivers behind shifts in OPS and Swap metrics using established SOP frameworks.
- Identify demand fluctuations, operational efficiency variations, and changes in vehicle mix.
- Explain divergences and convergences between OPS and Swap trends with clear, data-backed reasoning.
- Provide concise, actionable insights focused on optimizing driver utilization and swap strategy.
Summary of SOPs to consider:
1. OPS↑ Swap↑ (Dominated by OPS): 
- OPS growth leads swaps growth but swap per OPS decreases.
- Driven by increased 2W/3W onboarding.
- Watch for 2W dominance in Delhi-region zones slowing swap growth.
- Weather disruptions (rain, heatwave) may reduce swap activity.
2. OPS↑ Swap↑ (Dominated by Swaps):
- Swap growth outpaces OPS growth.
- Increased 2nd+ swaps, driving distance, cross swaps, and tourism spikes.
- Indicates strong demand and more intense usage per driver.
3. OPS↑ Swap↑ (Balanced):
- OPS and swaps increase similarly.
- Onboarding and swap per OPS increase.
- Demand-driven behavior with 2nd+ swaps and driving distance rising.
4. OPS↑ Swap↓:
- OPS grows but swaps decline.
- Poor weather or disruptions reduce swap demand.
- Swap per OPS drops; driving distance decreases.
- Increased onboarding but external factors like impounding may suppress swaps.
5. OPS↓ Swap↑:
- OPS declines but swaps rise.
- Tourism demand or existing drivers taking more swaps.
- Swap per OPS and driving distance increase despite fewer drivers.
6. OPS↓ Swap↓ (OPS drops more than swaps):
- Driver inactivity and weather reduce OPS heavily.
- 1st swaps drop more than 2nd+ swaps.
- External disruptions or impounding affect operations.
7. OPS↓ Swap↓ (Swaps drop more than OPS):
- Swap per OPS declines with reduced demand.
- Driving distance and 2nd+ swaps drop.
- External events or weather disruptions impact both metrics.
Regional Note:
- For Delhi-NCR zones, compare 2W vs 3W onboarding and swap % trends to detect 2W dominance.
- For other zones, consider mainly 3W onboarding and swaps.
Use these SOPs to generate clear, data-driven explanations focused on driver onboarding quality, demand patterns, swap behavior, and external factors.
Keep the response focused, professional, and grounded strictly in the data — no fluff, only insightful analysis.
`
    }


    // Default fallback
    return userPrompt;
  };


  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
