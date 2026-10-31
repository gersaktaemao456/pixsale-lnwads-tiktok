/* PIXSALE — seed content
   These pages are shipped as data/pages/*.json and used as the demo store
   when no GitHub repository is connected yet. */
(function () {
  "use strict";

  function uid(prefix) {
    return (prefix || "b") + "_" + Math.random().toString(36).slice(2, 9);
  }

  var pages = [
    {
      id: "tiktok-shop-starter-kit",
      slug: "tiktok-shop-starter-kit",
      title: "TikTok Shop Starter Kit",
      brand: "PIXSALE Studio",
      status: "published",
      template: "product",
      theme: { accent: "#d91e36", mode: "light", font: "sans" },
      seo: {
        title: "TikTok Shop Starter Kit — เริ่มขายจริงใน 7 วัน",
        description: "ชุดเริ่มต้นสำหรับคนที่อยากขายบน TikTok Shop: เทมเพลต caption, ปฏิทินคอนเทนต์ 30 วัน, เช็กลิสต์ก่อนไลฟ์ และคลังคำตอบลูกค้า"
      },
      stats: { views: 12480, clicks: 842 },
      tracking: { facebookPixelId: "", lineTagId: "", tiktokPixelId: "" },
      customCss: "",
      createdAt: "2026-09-18T09:00:00+07:00",
      updatedAt: "2026-10-24T18:20:00+07:00",
      blocks: [
        {
          id: uid("hero"),
          type: "hero",
          props: {
            kicker: "เหลือ 12 ชิ้น · ลด 40%",
            title: "เริ่มขายบน TikTok",
            titleAccent: "ให้ได้จริงใน 7 วัน",
            subtitle: "ไม่ต้องมีทีม ไม่ต้องมีกล้องแพง — ใช้ชุดเริ่มต้นที่รวมทุกอย่างตั้งแต่ไอเดียคอนเทนต์แรก ไปจนถึงสคริปต์ปิดการขายในไลฟ์",
            badge: "ลด 40%",
            image: "/assets/img/kit.svg",
            imageAlt: "กล่องชุดเริ่มต้น TikTok Shop Starter Kit",
            ctaText: "สั่งซื้อชุดเริ่มต้น",
            ctaUrl: "#product",
            trust: ["ส่งไฟล์ทันทีหลังชำระ", "ใช้ได้ตลอดชีพ", "มีกลุ่มถามตอบ"]
          }
        },
        {
          id: uid("prod"),
          type: "product",
          props: {
            name: "TikTok Shop Starter Kit",
            description: "ไฟล์ดิจิทัล 4 ชุด + วิดีโอสอน 90 นาที เปิดอ่านได้ทุกอุปกรณ์",
            image: "/assets/img/kit.svg",
            price: 690,
            compareAt: 1150,
            stockLeft: 12,
            stockTotal: 50,
            ctaText: "สั่งซื้อตอนนี้ · ฿690",
            ctaUrl: "#product"
          }
        },
        {
          id: uid("bene"),
          type: "benefits",
          props: {
            title: "ในชุดมีอะไรบ้าง",
            items: [
              { icon: "calendar", title: "ปฏิทินคอนเทนต์ 30 วัน", desc: "ตารางโพสต์รายวัน พร้อมหัวข้อและเวลาที่เหมาะกับคนไทย" },
              { icon: "book", title: "เทมเพลต caption 25 แบบ", desc: "คัดลอกไปใช้ได้ทันที ปรับตามสินค้าของคุณ" },
              { icon: "check", title: "เช็กลิสต์ก่อนไลฟ์", desc: "เตรียมสินค้า แสง เสียง และลำดับการพูดใน 1 หน้า" },
              { icon: "chat", title: "คลังตอบลูกค้า 40 ประโยค", desc: "ตอบคำถามยอดนิยมเรื่องส่งของ เปลี่ยนคืน และโปรโมชัน" }
            ]
          }
        },
        {
          id: uid("rev"),
          type: "reviews",
          props: {
            title: "เสียงจากคนที่เริ่มแล้ว",
            rating: 4.9,
            count: 218,
            items: [
              {
                name: "ณภัทร ศ.",
                text: "ใช้ปฏิทิน 30 วันแล้วโพสต์ต่อเนื่อง คลิปแรกที่ทำตามได้ 3.2 หมื่นวิว ขายได้ 14 ออเดอร์ในสัปดาห์แรก",
                rating: 5,
                avatar: "/assets/img/avatar-1.svg",
                verified: true
              },
              {
                name: "กิตติพงษ์ ท.",
                text: "เช็กลิสต์ก่อนไลฟ์ช่วยมากครับ เมื่อก่อนพูดไปเรื่อย ตอนนี้มีลำดับชัด ลูกค้าอยู่ยาวขึ้น",
                rating: 5,
                avatar: "/assets/img/avatar-2.svg",
                verified: true
              },
              {
                name: "พิมพ์ชนก ส.",
                text: "ชอบที่ไฟล์กระชับ ไม่ยัดทฤษฎี ยกตัวอย่างจริงและเอาไปใช้ได้เลย",
                rating: 4,
                avatar: "/assets/img/avatar-3.svg",
                verified: true
              }
            ]
          }
        },
        {
          id: uid("cd"),
          type: "countdown",
          props: {
            title: "ราคาเปิดตัว",
            subtitle: "หลังหมดเวลา กลับไปราคาเต็ม ฿1,150",
            endsAt: "2026-11-30T23:59:59+07:00"
          }
        },
        {
          id: uid("faq"),
          type: "faq",
          props: {
            title: "คำถามก่อนสั่งซื้อ",
            items: [
              { q: "ได้รับไฟล์เมื่อไร", a: "ทันทีหลังชำระเงิน ระบบจะส่งลิงก์ดาวน์โหลดไปที่อีเมลของคุณ และมีสำรองในหน้าสั่งซื้ออีกครั้ง" },
              { q: "ใช้กับสินค้าอะไรได้บ้าง", a: "ใช้ได้กับสินค้าทุกประเภทบน TikTok Shop ทั้งของใช้ในบ้าน ความงาม และแฟชั่น เพราะเป็นโครงสร้างเนื้อหา ไม่ใช่สคริปต์ตายตัว" },
              { q: "มีอายุการใช้งานไหม", a: "ไม่มีครับ ไฟล์เป็นของคุณตลอดชีพ รวมถึงอัปเดตครั้งถัดไป" },
              { q: "ขอใบเสร็จได้ไหม", a: "ได้ครับ ระบุชื่อและเลขผู้เสียภาษีในหน้าชำระเงิน ระบบจะออกใบเสร็จให้อัตโนมัติ" }
            ]
          }
        },
        {
          id: uid("cta"),
          type: "cta",
          props: {
            title: "พร้อมเริ่มคืนนี้?",
            subtitle: "ใช้เวลา 7 วันแรกให้คุ้ม — เริ่มจากคลิปแรกที่คุณยังไม่ได้ถ่าย",
            buttonText: "สั่งซื้อเลย · ฿690",
            buttonUrl: "#product",
            note: "ชำระผ่าน PromptPay หรือบัตร · ใบเสร็จส่งทางอีเมล"
          }
        },
        {
          id: uid("foot"),
          type: "footer",
          props: {
            note: "© 2026 PIXSALE Studio · สงวนสิทธิ์ทุกข้อ",
            showBadge: true
          }
        }
      ]
    },

    {
      id: "glow-serum-02",
      slug: "glow-serum-02",
      title: "Glow Serum 02",
      brand: "PIXSALE Skin",
      status: "draft",
      template: "product",
      theme: { accent: "#b07a3c", mode: "light", font: "sans" },
      seo: {
        title: "Glow Serum 02 — ซีรั่มไนอะซินาไมด์",
        description: "ซีรั่มเนื้อบางเบา ผสานไนอะซินาไมด์และสารสกัดจากข้าว ช่วยให้ผิวดูเรียบเนียนและสว่างขึ้นใน 14 วัน"
      },
      stats: { views: 3160, clicks: 128 },
      tracking: { facebookPixelId: "", lineTagId: "", tiktokPixelId: "" },
      customCss: "",
      createdAt: "2026-10-02T11:20:00+07:00",
      updatedAt: "2026-10-25T09:05:00+07:00",
      blocks: [
        {
          id: uid("hero"),
          type: "hero",
          props: {
            kicker: "ใหม่ · เปิดตัวรอบสอง",
            title: "ผิวดูเรียบเนียน",
            titleAccent: "ขึ้นใน 14 วัน",
            subtitle: "ซีรั่มเนื้อบางเบา ผสานไนอะซินาไมด์ 5% และสารสกัดจากข้าวหอมมะลิ สำหรับผิวที่ต้องการความสว่างแบบไม่หนักหน้า",
            badge: "ใหม่",
            image: "/assets/img/serum.svg",
            imageAlt: "ขวด Glow Serum 02",
            ctaText: "ทดลองขนาด 30 มล.",
            ctaUrl: "#product",
            trust: ["ผ่านการทดสอบโดย dermatologist", "ไม่มีน้ำหอม", "เหมาะกับผิวแพ้ง่าย"]
          }
        },
        {
          id: uid("prod"),
          type: "product",
          props: {
            name: "Glow Serum 02",
            description: "ไนอะซินาไมด์ 5% + สารสกัดข้าว · 30 มล. ใช้ได้ประมาณ 2 เดือน",
            image: "/assets/img/serum.svg",
            price: 890,
            compareAt: 1190,
            stockLeft: 34,
            stockTotal: 100,
            ctaText: "เพิ่มลงตะกร้า · ฿890",
            ctaUrl: "#product"
          }
        },
        {
          id: uid("gal"),
          type: "gallery",
          props: {
            title: "เนื้อสัมผัสและบรรจุภัณฑ์",
            images: [
              { src: "/assets/img/flatlay.svg", alt: "ภาพนิ่งขวดซีรั่มบนผ้า" },
              { src: "/assets/img/texture.svg", alt: "เนื้อครีมซีรั่ม" },
              { src: "/assets/img/serum.svg", alt: "ขวดซีรั่มระยะใกล้" }
            ]
          }
        },
        {
          id: uid("bene"),
          type: "benefits",
          props: {
            title: "ทำไมต้องขวดนี้",
            items: [
              { icon: "spark", title: "ลดเลือนจุดด่างดำ", desc: "ไนอะซินาไมด์ช่วยปรับโทนผิวให้สม่ำเสมอเมื่อใช้ต่อเนื่อง" },
              { icon: "shield", title: "อ่อนโยนต่อผิวแพ้ง่าย", desc: "ไม่มีแอลกอฮอล์และน้ำหอม ปรับค่า pH ให้ใกล้ผิวธรรมชาติ" },
              { icon: "check", title: "ซึมไว ไม่เหนอะ", desc: "เนื้อเซรั่มบางเบา ใช้ต่อกับกันแดดหรือเมคอัพได้" }
            ]
          }
        },
        {
          id: uid("rev"),
          type: "reviews",
          props: {
            title: "รีวิวจากผู้ใช้จริง",
            rating: 4.8,
            count: 96,
            items: [
              { name: "อารยา ม.", text: "ใช้ครบ 2 สัปดาห์ รอยแดงจากสิวดูจางลง ชอบที่เนื้อบาง ไม่ทำให้หน้าเงา", rating: 5, avatar: "/assets/img/avatar-3.svg", verified: true },
              { name: "ธนวัฒน์ ก.", text: "ผู้ชายใช้ได้นะครับ ไม่อุดตัน ใช้ก่อนนอนแล้วตอนเช้าหน้านิ่งขึ้น", rating: 5, avatar: "/assets/img/avatar-2.svg", verified: true }
            ]
          }
        },
        {
          id: uid("cta"),
          type: "cta",
          props: {
            title: "ลองขวดแรกวันนี้",
            subtitle: "มีตัวอย่างทดลองขนาด 5 มล. สำหรับคนที่ยังไม่แน่ใจ",
            buttonText: "ดูขนาดและราคา",
            buttonUrl: "#product",
            note: "ส่งฟรีเมื่อซื้อครบ ฿1,200"
          }
        },
        {
          id: uid("foot"),
          type: "footer",
          props: { note: "© 2026 PIXSALE Skin · เครื่องสำอาง", showBadge: true }
        }
      ]
    },

    {
      id: "napat-creator",
      slug: "napat-creator",
      title: "ณภัทร — ลิงก์ทั้งหมด",
      brand: "Napat",
      status: "published",
      template: "bio",
      theme: { accent: "#d91e36", mode: "dark", font: "sans" },
      seo: {
        title: "ณภัทร — ของใช้ในบ้านที่ใช้จริง",
        description: "รวมลิงก์ร้านค้า ช่องทางติดต่อ และคลิปรีวิวของณภัทร"
      },
      stats: { views: 8940, clicks: 1560 },
      tracking: { facebookPixelId: "", lineTagId: "", tiktokPixelId: "" },
      customCss: "",
      createdAt: "2026-08-11T14:00:00+07:00",
      updatedAt: "2026-10-20T20:10:00+07:00",
      blocks: [
        {
          id: uid("hero"),
          type: "hero",
          props: {
            kicker: "ครีเอเตอร์ · กรุงเทพฯ",
            title: "ณภัทร",
            titleAccent: "ของใช้ในบ้านที่ฉันใช้จริง",
            subtitle: "รีวิวของใช้บ้าน ๆ แบบไม่ต้องแต่งเยอะ — ทุกชิ้นที่แนะนำคือของที่ใช้อยู่ในบ้านจริง",
            image: "/assets/img/avatar-1.svg",
            imageAlt: "ณภัทร",
            avatar: true,
            ctaText: "",
            ctaUrl: "",
            trust: ["TikTok 128K", "รีวิว 240 คลิป", "ตอบทุกข้อความ"]
          }
        },
        {
          id: uid("links"),
          type: "links",
          props: {
            title: "ลิงก์ทั้งหมด",
            items: [
              { icon: "tiktok", label: "TikTok — คลิปรีวิวล่าสุด", sub: "@napat.home", url: "https://www.tiktok.com/" },
              { icon: "shop", label: "ร้าน Shopee", sub: "ของใช้ที่รีวิวทั้งหมด", url: "https://shopee.co.th/" },
              { icon: "line", label: "LINE OA — สอบถามก่อนซื้อ", sub: "@napat.home", url: "https://line.me/" },
              { icon: "youtube", label: "YouTube — รีวิวแบบยาว", sub: "ทุกวันอาทิตย์", url: "https://www.youtube.com/" }
            ]
          }
        },
        {
          id: uid("cta"),
          type: "cta",
          props: {
            title: "อยากให้รีวิวสินค้า?",
            subtitle: "ส่งรายละเอียดสินค้าและช่วงเวลาที่ต้องการได้เลย",
            buttonText: "ติดต่อร่วมงาน",
            buttonUrl: "https://line.me/",
            note: "รับเฉพาะสินค้าที่ตรงกับไลฟ์สไตล์ของช่อง"
          }
        },
        {
          id: uid("foot"),
          type: "footer",
          props: { note: "© 2026 Napat · ลิงก์ทั้งหมดในหน้าเดียว", showBadge: true }
        }
      ]
    }
  ];

  // ---------- templates ----------
  function tplProduct(title) {
    return [
      { type: "hero", props: { kicker: "ลด 20% วันนี้", title: "สินค้าของคุณ", titleAccent: "พร้อมส่งถึงมือลูกค้า", subtitle: "อธิบายสั้น ๆ ว่าสินค้านี้ช่วยอะไรกับลูกค้า และทำไมต้องเลือกคุณ", badge: "ใหม่", image: "/assets/img/kit.svg", imageAlt: "", ctaText: "สั่งซื้อตอนนี้", ctaUrl: "#product", trust: ["ส่งไว", "ของแท้", "มีรีวิว"] } },
      { type: "product", props: { name: title || "ชื่อสินค้า", description: "รายละเอียดสั้น ๆ เกี่ยวกับสินค้า", image: "/assets/img/kit.svg", price: 590, compareAt: 790, stockLeft: 20, stockTotal: 50, ctaText: "สั่งซื้อ · ฿590", ctaUrl: "#product" } },
      { type: "benefits", props: { title: "จุดเด่นที่ลูกค้าจะได้รับ", items: [
        { icon: "check", title: "จุดเด่นข้อที่หนึ่ง", desc: "อธิบายสั้น ๆ ว่าแตกต่างอย่างไร" },
        { icon: "spark", title: "จุดเด่นข้อที่สอง", desc: "อธิบายสั้น ๆ ว่าแตกต่างอย่างไร" },
        { icon: "shield", title: "จุดเด่นข้อที่สาม", desc: "อธิบายสั้น ๆ ว่าแตกต่างอย่างไร" }
      ] } },
      { type: "reviews", props: { title: "ลูกค้าพูดถึงเรา", rating: 5, count: 24, items: [
        { name: "ลูกค้าคนแรก", text: "ใส่รีวิวจริงจากลูกค้าของคุณที่นี่", rating: 5, avatar: "/assets/img/avatar-1.svg", verified: true }
      ] } },
      { type: "cta", props: { title: "พร้อมสั่งซื้อหรือยัง?", subtitle: "กดปุ่มด้านล่างเพื่อสั่งซื้อ", buttonText: "สั่งซื้อเลย", buttonUrl: "#product", note: "ชำระเงินอย่างปลอดภัย" } },
      { type: "footer", props: { note: "© 2026 แบรนด์ของคุณ", showBadge: true } }
    ];
  }

  function tplFlash(title) {
    return [
      { type: "hero", props: { kicker: "แฟลชเซล · 24 ชั่วโมง", title: "ลดแรงเฉพาะวันนี้", titleAccent: "ก่อนของหมด", subtitle: "โปรโมชันจำกัดเวลา ใส่รายละเอียดสั้น ๆ ที่ทำให้ลูกค้าตัดสินใจเร็วขึ้น", badge: "LIMITED", image: "/assets/img/kit.svg", imageAlt: "", ctaText: "ดูราคาพิเศษ", ctaUrl: "#product", trust: ["จำกัดจำนวน", "ไม่มีการต่อรอง", "ส่งฟรี"] } },
      { type: "countdown", props: { title: "เหลือเวลาอีก", subtitle: "ราคานี้ใช้ได้ถึงเวลาที่กำหนดเท่านั้น", endsAt: "2026-12-31T23:59:59+07:00" } },
      { type: "product", props: { name: title || "สินค้าโปรโมชัน", description: "รายละเอียดสั้น ๆ", image: "/assets/img/kit.svg", price: 390, compareAt: 690, stockLeft: 8, stockTotal: 40, ctaText: "คว้าโปรนี้ · ฿390", ctaUrl: "#product" } },
      { type: "benefits", props: { title: "ทำไมต้องคว้าโปรนี้", items: [
        { icon: "spark", title: "ราคาต่ำที่สุดของปี", desc: "ลดเฉพาะรอบนี้เท่านั้น" },
        { icon: "check", title: "ของพร้อมส่ง", desc: "สั่งก่อน 15:00 ส่งออกวันเดียวกัน" }
      ] } },
      { type: "faq", props: { title: "คำถามเรื่องโปร", items: [
        { q: "โปรนี้ถึงเมื่อไร", a: "ถึงเวลาที่ระบุไว้ในหน้านี้ หรือจนกว่าสินค้าจะหมด" },
        { q: "สั่งแล้วยกเลิกได้ไหม", a: "แจ้งยกเลิกได้ก่อนจัดส่ง หากยังไม่ได้รับเลขพัสดุ" }
      ] } },
      { type: "cta", props: { title: "ของหมดแล้วจะพลาด", subtitle: "กดสั่งก่อนเวลาหมด", buttonText: "สั่งเลย", buttonUrl: "#product", note: "จำกัด 1 ออเดอร์ต่อคน" } },
      { type: "footer", props: { note: "© 2026 แบรนด์ของคุณ", showBadge: true } }
    ];
  }

  function tplBio(title) {
    return [
      { type: "hero", props: { kicker: "ครีเอเตอร์", title: title || "ชื่อของคุณ", titleAccent: "ลิงก์ทั้งหมดในที่เดียว", subtitle: "แนะนำตัวเองสั้น ๆ ว่าคุณทำอะไร และคนควรกดลิงก์ไหนก่อน", image: "/assets/img/avatar-1.svg", imageAlt: "", avatar: true, ctaText: "", ctaUrl: "", trust: ["279K followers", "ตอบทุกข้อความ"] } },
      { type: "links", props: { title: "ลิงก์ทั้งหมด", items: [
        { icon: "tiktok", label: "TikTok", sub: "คลิปล่าสุด", url: "https://www.tiktok.com/" },
        { icon: "shop", label: "ร้านค้า", sub: "สินค้าที่แนะนำ", url: "https://shopee.co.th/" },
        { icon: "line", label: "LINE", sub: "ติดต่อสอบถาม", url: "https://line.me/" }
      ] } },
      { type: "cta", props: { title: "ติดต่องาน", subtitle: "ส่งรายละเอียดมาได้เลย", buttonText: "ส่งอีเมล", buttonUrl: "mailto:hello@example.com", note: "" } },
      { type: "footer", props: { note: "© 2026 ชื่อของคุณ", showBadge: true } }
    ];
  }

  function fillBlocks(list) {
    return list.map(function (b) {
      return { id: uid(b.type), type: b.type, props: b.props };
    });
  }

  window.PIXSeed = {
    pages: pages,
    templates: [
      { key: "product", name: "Product page", desc: "หน้าแนะนำสินค้าเดียว ปิดการขายในหน้า", build: tplProduct },
      { key: "flash", name: "Flash sale", desc: "โปรจำกัดเวลา พร้อมตัวนับถอยหลัง", build: tplFlash },
      { key: "bio", name: "Creator bio", desc: "รวมลิงก์และช่องทางติดต่อ", build: tplBio }
    ],
    create: function (templateKey, title, slug) {
      var tpl = this.templates.filter(function (t) { return t.key === templateKey; })[0] || this.templates[0];
      var now = new Date().toISOString();
      return {
        id: slug,
        slug: slug,
        title: title,
        brand: (window.PIX && window.PIX.brand.studio) || "PIXSALE Studio",
        status: "draft",
        template: tpl.key,
        theme: { accent: "#d91e36", mode: "light", font: "sans" },
        seo: { title: title, description: "" },
        stats: { views: 0, clicks: 0 },
        tracking: { facebookPixelId: "", lineTagId: "", tiktokPixelId: "" },
        customCss: "",
        createdAt: now,
        updatedAt: now,
        blocks: fillBlocks(tpl.build(title))
      };
    },
    freshBlocks: fillBlocks
  };
})();
