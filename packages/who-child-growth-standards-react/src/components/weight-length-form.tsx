import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, Input } from "@community-nutrition/ui"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const weightLengthSchema = z.object({
  length: z
    .number()
    .positive("Length must be positive")
    .min(0.1, "Length must be at least 0.1 cm"),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.01, "Weight must be at least 0.01 kg"),
})

export type WeightLengthFormData = z.infer<typeof weightLengthSchema>

export interface WeightLengthFormProps {
  onSubmit: (data: WeightLengthFormData) => void | Promise<void>
}

export const WeightLengthForm = ({ onSubmit }: WeightLengthFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeightLengthFormData>({
    resolver: zodResolver(weightLengthSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Weight Length Form</FieldLegend>

          <Field data-invalid={!!errors.length}>
            <FieldLabel htmlFor="length">Length (cm)</FieldLabel>
            <Input
              id="length"
              type="number"
              step="0.1"
              aria-invalid={!!errors.length}
              {...register("length", { valueAsNumber: true })}
            />
            <FieldError errors={errors.length ? [errors.length] : undefined} />
          </Field>

          <Field data-invalid={!!errors.weight}>
            <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
            <Input
              id="weight"
              type="number"
              step="0.01"
              aria-invalid={!!errors.weight}
              {...register("weight", { valueAsNumber: true })}
            />
            <FieldError errors={errors.weight ? [errors.weight] : undefined} />
          </Field>
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
