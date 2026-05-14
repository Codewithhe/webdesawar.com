import { SITE_NAME } from "../site";

export const HOME_FAQ_ITEMS = [
  {
    question: `What time is the ${SITE_NAME} result published?`,
    answer: `The ${SITE_NAME} evening result is typically updated around 7:30 PM IST after the official draw window closes.`,
  },
  {
    question: `How fast are ${SITE_NAME} fast result updates on this site?`,
    answer: `Result pages are server-rendered and refreshed on a short interval so visitors can check ${SITE_NAME} today result without waiting for heavy client-side loading.`,
  },
  {
    question: `Where can I view the ${SITE_NAME} monthly chart and old results?`,
    answer: `Use the monthly chart page for historical ${SITE_NAME} result data, including older draws and chart-style listings in one place.`,
  },
  {
    question: `Is this website the official ${SITE_NAME} source?`,
    answer: `This site publishes ${SITE_NAME} result updates for quick reference. Always verify important outcomes against the official source you trust.`,
  },
] as const;

export const HOME_SEO_SECTIONS = [
  {
    id: "mini-desawar-result-today",
    title: "Mini Desawar Result Today",
    paragraphs: [
      `${SITE_NAME} result today is shown on the homepage as soon as the latest draw data is available. The live card highlights the current date, draw time, and whether today's number is still waiting or already published.`,
      `Visitors searching for ${SITE_NAME} today result can use the refresh control to request the newest server-rendered update without reloading unrelated parts of the page.`,
    ],
  },
  {
    id: "live-mini-desawar-updates",
    title: "Live Mini Desawar Updates",
    paragraphs: [
      `Live ${SITE_NAME} updates are delivered through server-rendered HTML so mobile and desktop users get the same fast experience. Schedule strips, today's result card, and recent chart rows stay aligned with the latest API response.`,
      `The site is tuned for people who want ${SITE_NAME} fast result access at peak evening hours, with clear status labels for live and waiting states.`,
    ],
  },
  {
    id: "fast-result-information",
    title: "Fast Result Information",
    paragraphs: [
      `Fast result information includes the published number, draw time, and a short recent history table for quick comparison. A dedicated monthly chart page provides deeper Desawar result history when you need more than today's line.`,
      `Internal links between the homepage, monthly chart, and result sections make it easier for search engines and visitors to discover related ${SITE_NAME} result pages in one crawlable structure.`,
    ],
  },
] as const;
