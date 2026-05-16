import { WHATSAPP_URL } from "../lib/site";
import WhatsAppIcon from "./whatsapp-icon";

export default function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href={WHATSAPP_URL}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="WhatsApp पर गेम खेलने के लिए संदेश भेजें"
    >
      <span className="whatsapp-float-icon-wrap" aria-hidden="true">
        <WhatsAppIcon className="whatsapp-float-icon" />
      </span>
      <span className="whatsapp-float-label">WhatsApp</span>
    </a>
  );
}
