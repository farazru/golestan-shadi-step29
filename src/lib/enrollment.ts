import { isNationalId, normalizeIdNumber } from "@/lib/digits";

export const RECORD_KEYS = [
  "section",
  "year",
  "fullName",
  "nationalId",
  "idSerial",
  "idIssuePlace",
  "birthPlace",
  "birthDate",
  "nationality",
  "religion",
  "sect",
  "livesWith",
  "insurance",
  "transport",
  "childOrder",
  "handedness",
  "parentsRelated",
  "homeAddress",
  "postalCode",
  "emergencyPhone",
  "grade",
  "fatherFirst",
  "fatherLast",
  "fatherNationalId",
  "fatherEducation",
  "fatherField",
  "fatherIdSerial",
  "fatherBirthDate",
  "fatherIdIssuePlace",
  "fatherBirthPlace",
  "fatherJob",
  "fatherWorkAddress",
  "fatherPhone",
  "fatherMarital",
  "motherFirst",
  "motherLast",
  "motherNationalId",
  "motherEducation",
  "motherField",
  "motherIdSerial",
  "motherBirthDate",
  "motherIdIssuePlace",
  "motherBirthPlace",
  "motherJob",
  "motherPhone",
  "motherHousing",
  "motherWorkAddress",
  "motherMarital",
  "contractDate",
  "guardianTitle",
  "guardianName",
  "feeRial",
  "committedRial",
] as const;

export type RecordKey = (typeof RECORD_KEYS)[number];
export type RecordPayload = Record<RecordKey, string> & {
  payments: { type: string; date: string; receipt: string; bank: string; branchCode: string; branch: string; date2: string; amount: string }[];
};

const ID_KEYS = ["nationalId", "fatherNationalId", "motherNationalId"] as const;

export function emptyPayload(): RecordPayload {
  const base = Object.fromEntries(RECORD_KEYS.map((k) => [k, ""])) as Record<RecordKey, string>;
  return {
    ...base,
    nationality: "ایرانی",
    religion: "اسلام",
    sect: "شیعه",
    livesWith: "با پدر و مادر",
    year: "1405-1406",
    payments: [0, 1, 2, 3].map(() => ({
      type: "",
      date: "",
      receipt: "",
      bank: "",
      branchCode: "",
      branch: "",
      date2: "",
      amount: "",
    })),
  };
}

function clip(value: unknown, max = 300) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanPayload(input: unknown): { payload: RecordPayload; error?: string } {
  const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const payload = emptyPayload();
  for (const key of RECORD_KEYS) payload[key] = clip(src[key]);
  const rawPays = Array.isArray(src.payments) ? src.payments : [];
  payload.payments = payload.payments.map((row, i) => {
    const p = rawPays[i] && typeof rawPays[i] === "object" ? (rawPays[i] as Record<string, unknown>) : {};
    return {
      type: clip(p.type, 40),
      date: clip(p.date, 20),
      receipt: clip(p.receipt, 40),
      bank: clip(p.bank, 40),
      branchCode: clip(p.branchCode, 20),
      branch: clip(p.branch, 40),
      date2: clip(p.date2, 20),
      amount: clip(p.amount, 20),
    };
  });
  for (const key of ID_KEYS) {
    if (!payload[key]) continue;
    const id = normalizeIdNumber(payload[key]);
    if (!isNationalId(id)) return { payload, error: "کد ملی باید دقیقاً ۱۰ رقم باشد." };
    payload[key] = id;
  }
  return { payload };
}

export function teacherSlice(payload: RecordPayload, name: string, grade: string | null) {
  return {
    fullName: name,
    grade: grade || payload.grade || null,
    emergencyPhone: payload.emergencyPhone || null,
    fatherPhone: payload.fatherPhone || null,
    motherPhone: payload.motherPhone || null,
    livesWith: payload.livesWith || null,
    transport: payload.transport || null,
  };
}
