// หน้าสาขาหนองคายภาษาลาว / อังกฤษ — ข้อมูลที่เปลี่ยนได้ (เวลา เบอร์ ที่อยู่ไทย แบรนด์) ดึงจากหลังบ้าน
// ข้อความภาษาลาวควรให้คนลาวตรวจก่อนถือเป็นฉบับสุดท้าย
import type { Day } from "./branches";

export type Lang = "lo" | "en";
export const LANGS: Lang[] = ["lo", "en"];
export const intlPath = (l: Lang) => `/${l}/nong-khai`;
/** hreflang ของหน้าสาขาหนองคาย ทั้ง 3 ภาษา */
export const NONGKHAI_LANGUAGES = { th: "/nong-khai", lo: "/lo/nong-khai", en: "/en/nong-khai", "x-default": "/nong-khai" };

const DAY_NAMES: Record<Lang, Record<Day, string>> = {
  en: { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" },
  lo: { Monday: "ຈັນ", Tuesday: "ອັງຄານ", Wednesday: "ພຸດ", Thursday: "ພະຫັດ", Friday: "ສຸກ", Saturday: "ເສົາ", Sunday: "ອາທິດ" },
};
export const daysText = (l: Lang, days: Day[]) => (days.length === 7 ? T[l].daily : days.map((d) => DAY_NAMES[l][d]).join(", "));

/** +66984245224 → +66 98 424 5224 */
export function phoneIntlPretty(p: string) {
  const m = p.match(/^\+66(\d{2})(\d{3})(\d{4})$/);
  return m ? `+66 ${m[1]} ${m[2]} ${m[3]}` : p;
}

export const T = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    langName: "English",
    title: "Optical Shop in Nong Khai — Free Eye Test & Glasses",
    description: (hours: string, phone: string) =>
      `J.O. Vision Care Nong Khai: free eye test, prescription glasses ready in 1–7 days, genuine brand frames and sunglasses. Asawann 1 shopping complex, open daily ${hours}. Call ${phone}.`,
    eyebrow: "NONG KHAI BRANCH",
    h1: "J.O. Vision Care — Optical Shop in Nong Khai",
    lead: "Free eye tests, prescription glasses and genuine brand frames in Nong Khai. Many of our customers come from Laos — you are very welcome here.",
    whyTitle: "Why J.O. Vision Care",
    strengths: [
      ["Free eye test", "At both of our branches"],
      ["Standard equipment", "Eye tests with professional-standard equipment"],
      ["100% genuine brands", "Authentic frames and sunglasses"],
      ["Over 10 years of experience", "Caring for eyesight and fitting glasses"],
      ["Glasses ready in 1–7 days", "Depending on the lenses and your prescription"],
    ] as [string, string][],
    visitTitle: "Address & opening hours",
    place: "Asawann Shopping Complex 1 (Lotus side), next to KFC",
    area: "Mi Chai, Mueang Nong Khai, Nong Khai 43000, Thailand",
    addrLabel: "Address",
    thaiAddr: "Address in Thai (for GPS or taxi)",
    hoursLabel: "Opening hours",
    phoneLabel: "Phone",
    daily: "Open daily",
    closedNote: "No regular closing day. If we close on any day, we will post it on our Facebook page.",
    directions: "Directions (Google Maps)",
    call: "Call the shop",
    facebook: "Facebook page",
    line: "LINE",
    reviews: "Google reviews",
    servicesTitle: "Our services",
    services: [
      ["Free eye test", "Short-sightedness, long-sightedness and astigmatism"],
      ["Prescription glasses", "Made to your prescription and daily needs"],
      ["Lenses", "Single vision, blue light filter, photochromic (auto-tint) and progressive lenses"],
      ["Sunglasses", "Genuine brand sunglasses"],
      ["Kids' glasses", "Frames and lenses that fit children's faces and activities"],
      ["New lenses in your old frame", "If the frame is still in good condition"],
      ["Repair & adjustment", "Adjust temples and nose pads, replace screws, cleaning"],
    ] as [string, string][],
    brandsTitle: "Brands in our shop",
    payTitle: "We accept",
    faqTitle: "Frequently asked questions",
    faq: (hours: string, days: string) => [
      { q: "Is the eye test really free?", a: "Yes. Eye tests are free at both our Nong Khai and Udon Thani branches." },
      { q: "How long does it take to get my glasses?", a: "Usually 1–7 days, depending on the lenses and your prescription. We will tell you the pick-up date when you order." },
      { q: "Are you open on weekends?", a: `${days}, ${hours}. If we have to close on any day, we will post it on our Facebook page.` },
    ],
    ctaTitle: "Come and see us",
    ctaText: "Visit the shop any day, or call us first if you have questions.",
    thaiSite: "Thai website — more products and services",
    privacy: "Privacy policy (Thai)",
    cookieSettings: "Cookie settings",
    dockMap: "Map",
    dockCall: "Call",
    cookie: {
      text: "We use cookies to understand how visitors use our website (Google Analytics). No advertising cookies.",
      policy: "Privacy policy",
      deny: "Necessary only",
      accept: "Accept",
    },
  },
  lo: {
    htmlLang: "lo",
    ogLocale: "lo_LA",
    langName: "ພາສາລາວ",
    title: "ຮ້ານແວ່ນຕາ ໜອງຄາຍ ກວດສາຍຕາຟຣີ ຕັດແວ່ນ",
    description: (hours: string, phone: string) =>
      `J.O. Vision Care ສາຂາໜອງຄາຍ ກວດສາຍຕາຟຣີ ຕັດແວ່ນສາຍຕາ ຮັບແວ່ນພາຍໃນ 1–7 ມື້ ກອບແວ່ນ ແລະ ແວ່ນກັນແດດແບຣນແທ້ ຢູ່ຫ້າງອັດສະວັນ 1 ເປີດທຸກມື້ ${hours} ໂທ ${phone}`,
    eyebrow: "ສາຂາໜອງຄາຍ",
    h1: "J.O. Vision Care ຮ້ານແວ່ນຕາ ສາຂາໜອງຄາຍ",
    lead: "ກວດສາຍຕາຟຣີ ຕັດແວ່ນສາຍຕາ ແລະ ກອບແວ່ນແບຣນແທ້ ທີ່ໜອງຄາຍ. ລູກຄ້າຂອງພວກເຮົາຫຼາຍທ່ານມາຈາກລາວ — ຍິນດີຕ້ອນຮັບ ແລະ ຍິນດີໃຫ້ຄຳແນະນຳ.",
    whyTitle: "ເປັນຫຍັງຕ້ອງ J.O. Vision Care",
    strengths: [
      ["ກວດສາຍຕາຟຣີ", "ທັງສອງສາຂາ"],
      ["ເຄື່ອງມືໄດ້ມາດຕະຖານ", "ວັດຄ່າສາຍຕາດ້ວຍເຄື່ອງມືທີ່ໄດ້ມາດຕະຖານ"],
      ["ແບຣນແທ້ທຸກຊິ້ນ", "ກອບແວ່ນ ແລະ ແວ່ນກັນແດດຂອງແທ້"],
      ["ປະສົບການຫຼາຍກວ່າ 10 ປີ", "ດູແລສາຍຕາ ແລະ ປະກອບແວ່ນມາດົນນານ"],
      ["ຮັບແວ່ນພາຍໃນ 1–7 ມື້", "ຂຶ້ນກັບລາຍລະອຽດຂອງວຽກ ແລະ ຊະນິດເລນ"],
    ] as [string, string][],
    visitTitle: "ທີ່ຢູ່ ແລະ ເວລາເປີດ",
    place: "ຫ້າງອັດສະວັນ 1 (ຝັ່ງໂລຕັສ) ຂ້າງ KFC",
    area: "ຕາແສງມີໄຊ, ເມືອງໜອງຄາຍ, ແຂວງໜອງຄາຍ 43000, ປະເທດໄທ",
    addrLabel: "ທີ່ຢູ່",
    thaiAddr: "ທີ່ຢູ່ພາສາໄທ (ສຳລັບ GPS ຫຼື ລົດແທັກຊີ)",
    hoursLabel: "ເວລາເປີດ",
    phoneLabel: "ໂທລະສັບ",
    daily: "ເປີດທຸກມື້",
    closedNote: "ບໍ່ມີວັນພັກປະຈຳ. ຖ້າຮ້ານປິດວັນໃດ ຈະແຈ້ງທາງເພຈ Facebook.",
    directions: "ນຳທາງດ້ວຍ Google Maps",
    call: "ໂທຫາຮ້ານ",
    facebook: "ເພຈ Facebook",
    line: "LINE",
    reviews: "ຣີວິວໃນ Google",
    servicesTitle: "ບໍລິການຂອງພວກເຮົາ",
    services: [
      ["ກວດວັດສາຍຕາຟຣີ", "ສາຍຕາສັ້ນ ສາຍຕາຍາວ ແລະ ສາຍຕາອຽງ"],
      ["ຕັດແວ່ນສາຍຕາ", "ປະກອບແວ່ນຕາມຄ່າສາຍຕາ ແລະ ການນຳໃຊ້ຂອງທ່ານ"],
      ["ເລນແວ່ນຕາ", "ເລນຊັ້ນດຽວ, ເລນກັ່ນຕອງແສງສີຟ້າ, ເລນອໍໂຕ້ປັບແສງ ແລະ ເລນໂປຣເກຣສຊີບ"],
      ["ແວ່ນກັນແດດ", "ແວ່ນກັນແດດແບຣນແທ້"],
      ["ແວ່ນເດັກນ້ອຍ", "ກອບ ແລະ ເລນທີ່ເໝາະກັບໃບໜ້າ ແລະ ການນຳໃຊ້ຂອງເດັກ"],
      ["ປ່ຽນເລນໃສ່ກອບເກົ່າ", "ຖ້າກອບຍັງຢູ່ໃນສະພາບດີ"],
      ["ສ້ອມ ແລະ ປັບແວ່ນ", "ປັບຂາແວ່ນ ແລະ ດັງແວ່ນ, ປ່ຽນນັອດ, ທຳຄວາມສະອາດ"],
    ] as [string, string][],
    brandsTitle: "ແບຣນທີ່ມີໃນຮ້ານ",
    payTitle: "ຮັບຊຳລະດ້ວຍ",
    faqTitle: "ຄຳຖາມທີ່ພົບເລື້ອຍ",
    faq: (hours: string, days: string) => [
      { q: "ກວດສາຍຕາຟຣີແທ້ບໍ່?", a: "ແທ້. ກວດສາຍຕາຟຣີທັງສາຂາໜອງຄາຍ ແລະ ສາຂາອຸດອນທານີ." },
      { q: "ຕັດແວ່ນແລ້ວຕ້ອງລໍຖ້າຈັກມື້?", a: "ໂດຍທົ່ວໄປ 1–7 ມື້ ຂຶ້ນກັບຊະນິດເລນ ແລະ ຄ່າສາຍຕາ. ພະນັກງານຈະແຈ້ງວັນຮັບແວ່ນໃຫ້ຕອນສັ່ງຕັດ." },
      { q: "ເປີດວັນເສົາ-ອາທິດບໍ່?", a: `${days} ${hours}. ຖ້າຮ້ານປິດວັນໃດ ຈະແຈ້ງທາງເພຈ Facebook.` },
    ],
    ctaTitle: "ແວ່ມາຫາພວກເຮົາ",
    ctaText: "ມາທີ່ຮ້ານໄດ້ທຸກມື້ ຫຼື ໂທສອບຖາມກ່ອນກໍໄດ້.",
    thaiSite: "ເວັບໄຊພາສາໄທ — ສິນຄ້າ ແລະ ບໍລິການເພີ່ມເຕີມ",
    privacy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ (ພາສາໄທ)",
    cookieSettings: "ຕັ້ງຄ່າຄຸກກີ",
    dockMap: "ແຜນທີ່",
    dockCall: "ໂທ",
    cookie: {
      text: "ພວກເຮົາໃຊ້ຄຸກກີເພື່ອວິເຄາະການນຳໃຊ້ເວັບໄຊ (Google Analytics). ບໍ່ໃຊ້ຄຸກກີໂຄສະນາ.",
      policy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
      deny: "ສະເພາະທີ່ຈຳເປັນ",
      accept: "ຍອມຮັບ",
    },
  },
} as const;
