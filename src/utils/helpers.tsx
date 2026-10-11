import type { InputProps } from "../types/inputProps";
export function getInputProps(type: string = "text", label?: string): InputProps {
  return {
    varient: "bordered",
    type: type,
    label: label
  }
}
export function getAge(value: string) {
  const dob = new Date(value);
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() == dob.getMonth() &&
      today.getDate() < dob.getDate()
    )) {
    age--;
  }
  return age
}