import type { BPClassification, GlucoseClassification, GlucoseMeasurementType } from "@/types";

// AHA 2017 Blood Pressure guidelines
export function classifyBP(systolic: number, diastolic: number): BPClassification {
  if (systolic > 180 || diastolic > 120) return "Hypertensive Crisis";
  if (systolic >= 140 || diastolic >= 90) return "High Stage 2";
  if (systolic >= 130 || diastolic >= 80) return "High Stage 1";
  if (systolic >= 120 && diastolic < 80) return "Elevated";
  return "Normal";
}

export function getBPClassificationColor(c: BPClassification): string {
  switch (c) {
    case "Normal":              return "text-emerald-500";
    case "Elevated":            return "text-yellow-500";
    case "High Stage 1":        return "text-orange-500";
    case "High Stage 2":        return "text-red-500";
    case "Hypertensive Crisis": return "text-destructive";
  }
}

export function getBPBadgeVariant(c: BPClassification): "default" | "secondary" | "destructive" | "outline" {
  switch (c) {
    case "Normal":              return "secondary";
    case "Elevated":            return "outline";
    case "High Stage 1":        return "outline";
    case "High Stage 2":        return "default";
    case "Hypertensive Crisis": return "destructive";
  }
}

// Blood glucose classification by measurement type
// Fasting:   Normal < 100,  Prediabetes 100–125, Diabetes ≥ 126 (mg/dL)
// Post-meal: Normal < 140,  Prediabetes 140–199, Diabetes ≥ 200 (mg/dL)
// Random:    Normal < 140,  Concern ≥ 200 (mg/dL)
// Bedtime:   Same ranges as random (no universal guideline; used as proxy)
export function classifyGlucose(
  level: number,
  type: GlucoseMeasurementType
): GlucoseClassification {
  if (type === "fasting") {
    if (level >= 126) return "Diabetes";
    if (level >= 100) return "Prediabetes";
    return "Normal";
  }
  if (type === "post_meal") {
    if (level >= 200) return "Diabetes";
    if (level >= 140) return "Prediabetes";
    return "Normal";
  }
  // random and bedtime
  if (level >= 200) return "Concern";
  return "Normal";
}

export function getGlucoseClassificationColor(c: GlucoseClassification): string {
  switch (c) {
    case "Normal":     return "text-emerald-500";
    case "Prediabetes":return "text-yellow-500";
    case "Diabetes":   return "text-red-500";
    case "Concern":    return "text-orange-500";
  }
}

export function getGlucoseBadgeVariant(c: GlucoseClassification): "default" | "secondary" | "destructive" | "outline" {
  switch (c) {
    case "Normal":     return "secondary";
    case "Prediabetes":return "outline";
    case "Diabetes":   return "destructive";
    case "Concern":    return "default";
  }
}
