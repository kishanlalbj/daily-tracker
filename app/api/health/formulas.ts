export const calculateBMI = (weight: number, height: number) => {
  const bmi = weight / Math.pow(height, 2);
  return parseFloat(bmi.toFixed(1));
};

export function calculateBodyFat({
  gender,
  height,
  neck,
  waist,
  hip
}: {
  gender: "male" | "female";
  height: number;
  neck: number;
  waist: number;
  hip?: number;
}): number {
  const log = Math.log10;
  if (gender === "male") {
    const bf = 1.0324 - 0.19077 * log(waist - neck) + 0.15456 * log(height);
    const interim = 495 / bf;
    const result = interim - 450;
    return parseFloat(result.toFixed(1));
  }

  if (!hip) throw new Error("Hip is required for females");
  const result =
    163.205 * log(waist + hip - neck) - 97.684 * log(height) + 78.387;
  return parseFloat(result.toFixed(1));
}

export function calculateAverage(numbers: number[]) {
  const total = numbers.reduce((curr, prev) => curr + prev, 0);
  return (total / numbers.length).toFixed(1);
}
