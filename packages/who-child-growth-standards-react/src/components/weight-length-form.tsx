import { Button, Calendar, Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@community-nutrition/ui"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Gender } from "who-child-growth-standards"

const weightLengthSchema = z.object({
  length: z
    .number()
    .positive("Length must be positive")
    .min(0.1, "Length must be at least 0.1 cm"),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.01, "Weight must be at least 0.01 kg"),
  birthdate: z.date({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return issue.input === undefined
          ? "Birthdate is required"
          : "Please select a valid date";
      }
      return "Invalid date";
    },
  }),
  gender: z.enum(Gender),
})

export type WeightLengthFormData = z.infer<typeof weightLengthSchema>

export interface WeightLengthFormProps {
  onSubmit: (data: WeightLengthFormData) => void | Promise<void>
}

export const WeightLengthForm = ({ onSubmit }: WeightLengthFormProps) => {
  const {
    register,
    handleSubmit,
    control,
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

          <Field data-invalid={!!errors.birthdate}>
            <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
            <Controller
              name="birthdate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="birthdate"
                      type="button"
                      variant="outline"
                      data-empty={!field.value}
                      aria-invalid={!!errors.birthdate}
                      className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError
              errors={errors.birthdate ? [errors.birthdate] : undefined}
            />
          </Field>
          <Field data-invalid={!!errors.gender}>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Controller
              name="gender"
              control={control}
              defaultValue={Gender.Male}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="gender" aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Select a gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.Male}>Male</SelectItem>
                    <SelectItem value={Gender.Female}>Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.gender ? [errors.gender] : undefined} />
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
