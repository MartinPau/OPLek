// Data för alla anställda och deras tidigare arbetsplatser
const employeesData = [
  {
    id: "p1",
    name: "Maria Wikström Köpniwsky",
    anonId: "Nod 01",
    avatarColor: "#4f46e5",
    workplaces: [
      "ComplyIT",
      "Implantica",
      "Oriflame Cosmetics",
      "Pharmadule",
      "AstraZeneca",
      "SBL Vaccines"
    ]
  },
  {
    id: "p2",
    name: "Hanna Dahlenborg",
    anonId: "Nod 02",
    avatarColor: "#06b6d4",
    workplaces: [
      "Conroy Medical",
      "Biocool",
      "Wine Rebels",
      "Episurf Medical",
      "Permobil",
      "Invent Medic Sweden",
      "Novavax",
      "ComplyIT",
      "Masimo Sweden",
      "AstraZeneca",
      "Implantica",
      "SP Sveriges Tekniska Forskningsinstitut"
    ]
  },
  {
    id: "p3",
    name: "Maria Sundell",
    anonId: "Nod 03",
    avatarColor: "#10b981",
    workplaces: [
      "APL (Apotek Produktion & Laboratorier)",
      "Valneva",
      "AstraZeneca",
      "ComplyIT",
      "Octapharma",
      "AFRY",
      "Cepheid",
      "Wenner-Gren Institute",
      "Karolinska Institutet"
    ]
  },
  {
    id: "p4",
    name: "Josefin Norman",
    anonId: "Nod 04",
    avatarColor: "#f59e0b",
    workplaces: [
      "Permobil",
      "Optinova Group",
      "SHL Healthcare",
      "SHL Group",
      "Med&Care"
    ]
  },
  {
    id: "p5",
    name: "Paula Diago",
    anonId: "Nod 05",
    avatarColor: "#ec4899",
    workplaces: [
      "AstraZeneca",
      "Lemontree",
      "Valneva",
      "ComplyIT"
    ]
  },
  {
    id: "p6",
    name: "Farrah Vesali",
    anonId: "Nod 06",
    avatarColor: "#8b5cf6",
    workplaces: [
      "AFRY",
      "PRC Engineering",
      "Octapharma",
      "Sobi",
      "AstraZeneca",
      "Bohus Biotech",
      "Eurofins",
      "Cambrex Karlskoga",
      "Karolinska Institutet"
    ]
  },
  {
    id: "p7",
    name: "Maria Jansson",
    anonId: "Nod 07",
    avatarColor: "#3b82f6",
    workplaces: [
      "A3P Biomedical",
      "Certinli",
      "Handicare Group",
      "Implantica",
      "Nobel Biocare",
      "AstraZeneca"
    ]
  },
  {
    id: "p8",
    name: "Emelie Olsson",
    anonId: "Nod 08",
    avatarColor: "#14b8a6",
    workplaces: [
      "APL (Apotek Produktion & Laboratorier)",
      "Octapharma",
      "Allderma Pharmaceuticals",
      "Valneva",
      "Bjerking",
      "ComplyIT",
      "AstraZeneca",
      "Gabather",
      "Academic Work Sweden",
      "ALcontrol Laboratories"
    ]
  },
  {
    id: "p9",
    name: "Erica Sundgren",
    anonId: "Nod 09",
    avatarColor: "#f97316",
    workplaces: [
      "Conroy Medical",
      "NEP – Nordic Electronic Partner",
      "Innovationsplattformen VGR"
    ]
  },
  {
    id: "p10",
    name: "Manuel Otero Quevedo",
    anonId: "Nod 10",
    avatarColor: "#6366f1",
    workplaces: [
      "Permobil",
      "Altered Company",
      "Episurf Medical",
      "Nobel Biocare",
      "SGS Sweden"
    ]
  },
  {
    id: "p11",
    name: "Martin Paulsen",
    anonId: "Nod 11",
    avatarColor: "#0284c7",
    workplaces: [
      "Inera",
      "Noncomplicity",
      "Visiba Sverige",
      "Collective Minds Radiology",
      "RaySearch Laboratories",
      "ESSIQ",
      "Materialise",
      "Symbioteq",
      "Episurf Medical"
    ]
  },
  {
    id: "p12",
    name: "Dzana Sudic Hukic",
    anonId: "Nod 12",
    avatarColor: "#84cc16",
    workplaces: [
      "Plantvision",
      "Vittra",
      "Karolinska Institutet"
    ]
  },
  {
    id: "p13",
    name: "Asal Attabipour",
    anonId: "Nod 13",
    avatarColor: "#eab308",
    workplaces: [
      "Getinge",
      "Prevas",
      "Pharmacolog",
      "Direct Healthcare Group",
      "Boule Diagnostics",
      "Cepheid"
    ]
  },
  {
    id: "p14",
    name: "Sofie Lignell",
    anonId: "Nod 14",
    avatarColor: "#a855f7",
    workplaces: [
      "Elekta",
      "Kemikalieinspektionen",
      "Diversey Sweden",
      "AstraZeneca",
      "Lantmännen Agroetanol"
    ]
  },
  {
    id: "p15",
    name: "Carmen Vogt",
    anonId: "Nod 15",
    avatarColor: "#ef4444",
    workplaces: [
      "Bohus Biotech",
      "Key2Compliance",
      "KTH",
      "Karolinska Institutet"
    ]
  },
  {
    id: "p16",
    name: "Bing Wu",
    anonId: "Nod 16",
    avatarColor: "#059669",
    workplaces: [
      "Aurevia Medtech Compliance",
      "Intertek",
      "Nordberg Medical",
      "Scandinavian Development Services",
      "SwedenBIO",
      "CheernoNordic",
      "Shanghai Pharmaceuticals Holding"
    ]
  },
  {
    id: "p17",
    name: "Magdalena Zeberg",
    anonId: "Nod 17",
    avatarColor: "#d97706",
    workplaces: [
      "Procella Therapeutics",
      "Vironova",
      "Arta Plast",
      "Q-linea",
      "ComplyIT",
      "TSS",
      "AstraZeneca",
      "Nobel Biocare",
      "Boule Medical",
      "SATS ELIXIA"
    ]
  },
  {
    id: "p18",
    name: "Carolina Prost",
    anonId: "Nod 18",
    avatarColor: "#db2777",
    workplaces: [
      "Diamyd Medical",
      "ComplyIT",
      "Sobi",
      "Valneva",
      "AstraZeneca",
      "SYNLAB Analytics & Services Sweden"
    ]
  }
];

// Hjälpfunktioner för databearbetning
function getWorkplaceStats() {
  const counts = {};
  employeesData.forEach(p => {
    p.workplaces.forEach(w => {
      counts[w] = (counts[w] || 0) + 1;
    });
  });
  return counts;
}
