import { FieldContent, FieldLabel, FieldSet, Input } from "@community-nutrition/ui"

export const WeightLengthForm = () => {
  return (
    <FieldSet>
      <h1>Weight Length Form</h1>
      <FieldLabel>Length</FieldLabel>
      <FieldContent>
        <Input type="number" />
      </FieldContent>
    </FieldSet>
  )
}
